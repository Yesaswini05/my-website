const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. GET all tasks from database
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. POST (Save) a new task
router.post('/', async (req, res) => {
    const task = new Task({
        name: req.body.name,
        deadline: req.body.deadline
    });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;