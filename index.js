const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Question = require('./model/question');
const Answer = require('./model/answer');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/askdb';
const JWT_SECRET = process.env.JWT_SECRET || 'letmein';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Health
app.get('/', (req, res) => res.json({ ok: true }));

// Questions
app.get('/questions', async (req, res) => {
    // Public endpoint: only questions with key === 0
    // Only include answers where publish === true
    try {
        let qs = await Question.find({ key: 0 })
            .populate({ path: 'answers', match: { publish: true } })
            .sort({ createdAt: -1 });
        // Filter out questions that have no published answers
        qs = qs.filter(q => Array.isArray(q.answers) && q.answers.length > 0);
        res.json(qs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Middleware to authenticate Bearer token
function authenticateToken(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
    const token = parts[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Admin-only route: returns all questions regardless of key
app.get('/admin/questions', authenticateToken, async (req, res) => {
    if (!req.user || !req.user.admin) return res.status(403).json({ error: 'Admin access required' });
    try {
        const qs = await Question.find().sort({ createdAt: -1 });
        res.json(qs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Simple login route - issues JWT for admin
app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    // Fixed admin credentials per request
    if (username === 'MoSaS' && password === 'letmein') {
        const token = jwt.sign({ username, admin: true }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ token });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/questions', async (req, res) => {
    try {
        const { key, publish, thequestion, title } = req.body;
        const q = new Question({ key, publish, thequestion, title });
        await q.save();
        res.status(201).json(q);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/questions/:id', async (req, res) => {
    try {
        const q = await Question.findById(req.params.id).populate('answers');
        if (!q) return res.status(404).json({ error: 'Question not found' });
        res.json(q);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/questions/:id', async (req, res) => {
    try {
        const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!q) return res.status(404).json({ error: 'Question not found' });
        res.json(q);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/questions/:id', async (req, res) => {
    try {
        const q = await Question.findByIdAndDelete(req.params.id);
        if (!q) return res.status(404).json({ error: 'Question not found' });
        // Optionally remove answers
        await Answer.deleteMany({ question: q._id });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Answers
app.post('/questions/:id/answers', authenticateToken, async (req, res) => {
    // require admin to create answers
    if (!req.user || !req.user.admin) return res.status(403).json({ error: 'Admin access required' });
    try {
        const q = await Question.findById(req.params.id);
        if (!q) return res.status(404).json({ error: 'Question not found' });
        const { text, publish } = req.body;
        const a = new Answer({ text, publish, question: q._id });
        await a.save();
        q.answers.push(a._id);
        await q.save();
        res.status(201).json(a);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/answers/:id', async (req, res) => {
    try {
        const a = await Answer.findById(req.params.id).populate('question');
        if (!a) return res.status(404).json({ error: 'Answer not found' });
        res.json(a);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 4000, () => {
    console.log('Server running on port', process.env.PORT || 4000);
});
