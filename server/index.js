const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send('The server is up and running! 🌱 Play the game here: http://localhost:5173.');
});

// --- USER ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  character: { type: String, enum: ['girl', 'boy'], default: 'girl' },
  gameSave: { type: Object, default: null }
});

const User = mongoose.model('User', UserSchema);

// --- LOGIN & REGISTER ---

// 1. Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, character } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

// 2. Login
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

// 3. Save Game
app.post('/api/save', async (req, res) => {
  try {
    const { email, gameState } = req.body;
    await User.findOneAndUpdate({ email }, { gameSave: gameState });
    res.status(200).json({ message: "Game saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Load Game
app.get('/api/load/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.status(200).json(user.gameSave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connection: SUCCESS!")
    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("❌ Error connecting to MongoDB");
    console.error(err);
  });