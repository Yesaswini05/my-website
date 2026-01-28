const mongoose = require('mongoose');

// Define the schema using lowercase 't'
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    reminderTime: { type: Date, required: true }, 
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Use the exact same name 'taskSchema' (lowercase 't') here
module.exports = mongoose.model('Task', taskSchema);