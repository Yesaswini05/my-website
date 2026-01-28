const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 1. Load Environment Variables
dotenv.config();

const app = express();

// 2. Middleware
app.use(express.json()); 
app.use(express.static('public')); 

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// 4. Routes
// Home route to serve login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Auth Routes
const authRoutes = require('./backend/routes/auth');
app.use('/api/auth', authRoutes);

// Task Routes (If you have this file created)
const taskRoutes = require('./backend/routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// 5. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});