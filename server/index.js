const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Filter = require('bad-words');
const filter = new Filter();

dotenv.config();

const app = express();
app.use(express.json());

// --- CONFIGURARE SOCKET.IO (MMO MAGIC) 🎀 ---
const server = http.createServer(app); // Creăm serverul HTTP explicit
const io = new Server(server, {
    cors: {
        origin: "*", // Permitem conexiunea de oriunde (esențial pt dev)
        methods: ["GET", "POST"]
    }
});

// =========================================
// 🌦️ GLOBAL WEATHER SYSTEM
// =========================================
const weathers = ['sunny', 'rainy', 'cloudy', 'snowy'];
let currentGlobalWeather = 'sunny';

// Schimbăm vremea la fiecare 10 minute
setInterval(() => {
  currentGlobalWeather = weathers[Math.floor(Math.random() * weathers.length)];
  io.emit('weather_update', currentGlobalWeather);
  console.log(`🌦️ Server changed weather to: ${currentGlobalWeather}`);
}, 600000);

// =========================================
// 🧠 SERVER MEMORY (Keeps track of players)
// =========================================
let onlinePlayers = {}; 

io.on('connection', (socket) => {
    console.log(`✨ New player connected! ID: ${socket.id}`);

// 1. When entering the park (JOIN)
        socket.on('join-park', (data) => {
        const username = data.username || "Gardener";
        
        console.log(`🔍 Attempting join: ${username} (ID: ${socket.id})`);

        // GHOST BUSTERS
        const ghostIDs = [];
        for (const [id, player] of Object.entries(onlinePlayers)) {
            // Dacă găsim același nume...
            if (player.username === username) {
                ghostIDs.push(id);
            }
        }

        // Ștergem toate fantomele găsite
        ghostIDs.forEach(ghostId => {
            console.log(`👻 Kicking ghost ID: ${ghostId} for user: ${username}`);
            delete onlinePlayers[ghostId];
        });

        // Salvează jucătorul nou
        onlinePlayers[socket.id] = {
            id: socket.id,
            x: data.x || 400,
            y: data.y || 400,
            username: data.username || "Guest",
            isVeteran: data.isVeteran || false, 
            characterLook: data.characterLook || {} ,
            lastSeen: Date.now()
        };

        socket.emit('weather_update', currentGlobalWeather);

        console.log(`👋 ${data.username} joined the park.`);

        io.emit('update_players', onlinePlayers);
        
        // Notificarea o trimitem doar celorlalți
        socket.broadcast.emit('global_notification', {
            text: `✿ ${data.username || 'A friend'} joined the garden! ✿`
        });
    });

    // 2. When moving (MOVE)
    socket.on('move', (data) => {
        if (onlinePlayers[socket.id]) {
            // Update ONLY coordinates, but COPY old data (name, clothes)
            onlinePlayers[socket.id] = {
                ...onlinePlayers[socket.id], 
                x: data.x,
                y: data.y,
                lastSeen: Date.now()
            };
            io.emit('update_players', onlinePlayers);
        }
    });

    // 👇 3. CHAT SYSTEM 
    socket.on('chat_message', (msg) => {
        if (onlinePlayers[socket.id]) {
            try {
                // CLEAN BAD WORDS
                const cleanMessage = filter.clean(msg);
                
                // SEND CLEAN MSG
                io.emit('player_chat', {
                    id: socket.id,
                    text: cleanMessage
                });
            } catch (e) {
                // OR THE ORIGINAL
                io.emit('player_chat', { id: socket.id, text: msg });
            }
        }
    });

    // 3. When leaving (DISCONNECT)
    socket.on('disconnect', () => {
        console.log(`❌ Player disconnected: ${socket.id}`);
        delete onlinePlayers[socket.id]; // Remove from memory
        io.emit('update_players', onlinePlayers);
    });
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('The server is up! 🌱');
});

// ==========================================
// 1. DATABASE MODELS
// ==========================================

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  character: { type: String, enum: ['girl', 'boy'], default: 'girl' },
  gameSave: { type: Object, default: null },
  coins: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  characterLook: { type: Object, default: {} }
});

const User = mongoose.model('User', UserSchema);

// ==========================================
// 2. HELPER VARIABLES
// ==========================================

// Temporary memory for reset codes
const resetCodes = {}; 

// 🕒 Memory for Cooldowns (Spam Protection)
// Stores: { "alex@gmail.com": 1702819200000 }
const emailCooldowns = {}; 

// ==========================================
// MIDDLEWARE (SECURITY)
// ==========================================
const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  
  if (!tokenHeader) return res.status(401).json({ message: "Access Denied: No Token" });

  try {
    const token = tokenHeader.split(' ')[1]; // Remove "Bearer "
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// ==========================================
// 3. API ROUTES
// ==========================================

// --- REGISTER ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, character } = req.body;
    
    // Check if email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists!" });

    // 2. Check if USERNAME exists
    const userWithName = await User.findOne({ username });
    if (userWithName) {
        return res.status(400).json({ message: "Username already taken!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      character
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found!" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Wrong password!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secretKey");
    
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// 🛠️ FIX CLEANUP (Folosim onlinePlayers, nu players)
// =========================================
setInterval(() => {
  const now = Date.now();
  // ✅ MODIFICARE: onlinePlayers, nu players
  Object.keys(onlinePlayers).forEach(id => {
    if (onlinePlayers[id].lastSeen && now - onlinePlayers[id].lastSeen > 30000) {
      console.log(`👻 Cleanup inactive player: ${onlinePlayers[id].username}`);
      delete onlinePlayers[id];
      io.emit('update_players', onlinePlayers);
    }
  });
}, 10000);

// --- SAVE GAME (VERSIUNEA REPARATĂ) ---
app.post('/api/save', verifyToken, async (req, res) => {
  try {
    const { email, gameState } = req.body;
    let updateData = { $set: { gameSave: gameState } };
    
    // ✅ FIX: Acceptăm orice format și îl transformăm în Număr
    if (gameState && gameState.coins !== undefined) {
      const coinValue = Number(gameState.coins);
      if (!isNaN(coinValue)) updateData.$set.coins = coinValue;
    }

    await User.findOneAndUpdate({ email }, updateData, { upsert: true });
    res.status(200).json({ message: "Game saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🟢 PASSWORD RESET FLOW (3 STEPS)
// ==========================================

// STEP 1: SEND EMAIL (Debug Version)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log(`🔎 1. Received request for: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    // 🛑 COOLDOWN DISABLED FOR TESTING
    // const lastSentTime = emailCooldowns[email];
    // const now = Date.now();
    // if (lastSentTime && (now - lastSentTime) < 60000) { ... }

    // Generate Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes[email] = code; 
    console.log(`🔎 2. Generated Code: ${code}`);

    // Setup Gmail Sender (WITH DEBUGGING)
const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,       
      secure: true,       
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      logger: true,
      debug: true 
    });

    const mailOptions = {
      from: `"Plant Game" <${process.env.EMAIL_USER}>`, // Added Name for professional look
      to: email,
      subject: '🌱 Plant Game - Reset Code',
      text: `Hello Gardener!\n\nYour Password Reset Code is: ${code}\n\nGood luck!`
    };

    // SEND!
    console.log("🔎 3. Attempting to send to Gmail...");
    await transporter.sendMail(mailOptions);
    console.log(`✅ 4. Email successfully sent to ${email}`);
    
    res.json({ message: "Code sent to email" });

  } catch (err) {
    console.error("❌ CRASH AT STEP 3:", err); 
    // This will now show up in your Render logs!
    res.status(500).json({ message: "Could not send email", error: err.message });
  }
});

// STEP 2: VERIFY CODE ONLY
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (resetCodes[email] && resetCodes[email] === code) {
    return res.status(200).json({ message: "Code is valid" });
  } else {
    return res.status(400).json({ message: "Invalid or expired code" });
  }
});

// STEP 3: RESET PASSWORD (CHANGE IT)
app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // Check code again
    if (resetCodes[email] !== code) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Encrypt New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    delete resetCodes[email]; // Clear code

    res.json({ message: "Password updated successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ROUTE TO LOAD GAME & COINS (Fixes the Logout/Login wipe)
app.get('/api/load/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ CRITICAL: This pulls the coins YOU saved in the database
    // It does NOT force 125. It uses 'user.coins'.
    const responseData = {
      ...user.gameSave, 
      coins: user.coins, // <--- This is your REAL money
      characterLook: user.characterLook || user.gameSave?.characterLook
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("❌ Error connecting to MongoDB");
    console.error(err);
  });

  // FORCE PASSWORD RESET (Frontend already verified the code)
app.post('/api/reset-password-force', async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Encrypt the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }

  // Schimbă vremea global la 10 minute
setInterval(() => {
    const weathers = ['sunny', 'rainy', 'cloudy', 'snowy'];
    currentGlobalWeather = weathers[Math.floor(Math.random() * weathers.length)];
    io.emit('weather_update', currentGlobalWeather);
}, 600000);

});