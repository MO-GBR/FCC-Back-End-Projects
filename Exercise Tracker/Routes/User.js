const express = require('express');
const router = express.Router();
const { User, Exercise } = require('../DB/Models');

router.get('/api/users', async (req, res) => {
    try {
        const username = req.body.username?.trim();

        if (!username) return res.status(400).json({ error: 'username required' });

        // If username already exists return existing user (FCC expects new user; but returning existing is acceptable)
        let user = await User.findOne({ username }).exec();

        if (!user) {
            user = new User({ username });
            await user.save();
        }

        return res.json({ username: user.username, _id: user._id.toString() });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, { username: 1 }).exec();
        const out = users.map(u => ({ username: u.username, _id: u._id.toString() }));
        return res.json(out);
    } catch (err) {
        return res.status(500).json({ error: 'server error' });
    }
});

router.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const { _id } = req.params;
        const { description, duration, date } = req.body;
  
        if (!description || !duration) {
            return res.status(400).json({ error: 'description and duration are required' });
        }
  
        const durNum = Number(duration);
        if (Number.isNaN(durNum)) {
            return res.status(400).json({ error: 'duration must be a number' });
        }
  
        // date handling: if date not provided use current date
        let dateObj;
        if (!date) {
            dateObj = new Date();
        } else {
            // Accept yyyy-mm-dd (or any format parseable by Date)
            const d = new Date(date);
            if (d.toString() === 'Invalid Date') {
                return res.status(400).json({ error: 'Invalid Date' });
            }
            dateObj = d;
        }
  
        const user = await User.findById(_id).exec();
        if (!user) return res.status(404).json({ error: 'User not found' });
  
        const exercise = {
            description: String(description),
            duration: durNum,
            date: dateObj
        };
  
        user.log.push(exercise);
        await user.save();
  
        // Response shape: user object with exercise fields added
        return res.json({
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
            _id: user._id.toString()
        });
    } catch (err) {
        return res.status(500).json({ error: 'server error' });
    }
});

router.get('/api/users/:_id/logs', async (req, res) => {
    try {
        const { _id } = req.params;
        const { from, to, limit } = req.query;
  
        const user = await User.findById(_id).exec();
        if (!user) return res.status(404).json({ error: 'User not found' });
  
        // copy log to filter/sort without mutating DB doc
        let logs = user.log.map(e => ({
            description: e.description,
            duration: e.duration,
            date: e.date
        }));
  
        // Filter by from/to if provided
        if (from) {
            const fromDate = new Date(from);
            if (fromDate.toString() === 'Invalid Date') {
                return res.status(400).json({ error: 'Invalid from date' });
            }
            logs = logs.filter(l => l.date >= fromDate);
        }
        if (to) {
            const toDate = new Date(to);
            if (toDate.toString() === 'Invalid Date') {
                return res.status(400).json({ error: 'Invalid to date' });
            }
            logs = logs.filter(l => l.date <= toDate);
        }
  
        // Sort ascending by date (optional but predictable)
        logs.sort((a, b) => a.date - b.date);
  
        // Apply limit
        let limited = logs;
        if (limit) {
            const lim = Number(limit);
            if (Number.isNaN(lim) || lim < 0) {
                return res.status(400).json({ error: 'Invalid limit' });
            }
            limited = logs.slice(0, lim);
        }
  
        // Format date strings
        const logFormatted = limited.map(l => ({
            description: l.description,
            duration: l.duration,
            date: l.date.toDateString()
        }));
  
        return res.json({
            username: user.username,
            count: logs.length,
            _id: user._id.toString(),
            log: logFormatted
        });
  
    } catch (err) {
        return res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;