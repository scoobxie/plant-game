const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // 🟢 Required for email

dotenv.config();

const app = express();
app.use(express.json());
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
  gameSave: { type: Object, default: null }
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
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists!" });

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

// --- SAVE GAME ---
app.post('/api/save', verifyToken, async (req, res) => {
  try {
    const { email, gameState } = req.body;
    await User.findOneAndUpdate({ email }, { gameSave: gameState });
    res.status(200).json({ message: "Game saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOAD GAME ---
app.get('/api/load/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.status(200).json(user.gameSave);
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

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
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
});