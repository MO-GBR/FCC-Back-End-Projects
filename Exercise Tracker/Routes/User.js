const express = require('express');
const router = express.Router();
const { User, Exercise } = require('../DB/Models');

router.post('/api/users', async (req, res) => {
    try {
        const { username } = req.body;
        const user = new User({ username });
        const savedUser = await user.save();
        res.json({
            username: savedUser.username,
            _id: savedUser._id
        });
    } catch (err) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.get('/api/users', async (req, res) => {
    const users = await User.find({}, 'username _id');
    res.json(users);
});

router.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const { description, duration, date } = req.body;
        const user = await User.findById(req.params._id);
        if (!user) return res.json({ error: 'User not found' });
        
        const exercise = new Exercise({
            userId: user._id,
            description,
            duration: parseInt(duration),
            date: date ? new Date(date) : new Date()
        });
  
        const savedExercise = await exercise.save();
  
        res.json({
            username: user.username,
            description: savedExercise.description,
            duration: savedExercise.duration,
            date: savedExercise.date.toDateString(),
            _id: user._id
        });
    } catch (err) {
      res.status(500).json({ error: 'Error adding exercise' });
    }
});

router.get('/api/users/:_id/logs', async (req, res) => {
    try {
        const user = await User.findById(req.params._id);
        if (!user) return res.json({ error: 'User not found' });
  
        let { from, to, limit } = req.query;
        let filter = { userId: user._id };
  
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
  
        let query = Exercise.find(filter).select('description duration date -_id').sort({ date: 1 });
        if (limit) query = query.limit(parseInt(limit));
  
        const exercises = await query.exec();
  
        res.json({
            username: user.username,
            count: exercises.length,
            _id: user._id,
            log: exercises.map(e => ({
                description: e.description,
                duration: e.duration,
                date: e.date.toDateString()
            }))
        });
    } catch (err) {
        res.status(500).json({ error: 'Error getting logs' });
    }
});

module.exports = router;