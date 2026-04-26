const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { User, Question, ExamSettings, initializeDatabase } = require('./database');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'scholarly_monolith_super_secret_key';

// Nodemailer Test Account Setup
let transporter;
async function setupEmail() {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
    console.log("Mock Email (Ethereal) Configured.");
}
setupEmail();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});


// --- ADMIN ROUTES ---

// Manage Questions
app.get('/api/questions', authenticateToken, isAdmin, async (req, res) => {
    const questions = await Question.findAll();
    res.json(questions);
});

app.post('/api/questions', authenticateToken, isAdmin, async (req, res) => {
    const { text, options, correct_answer } = req.body;
    try {
        const q = await Question.create({ text, options, correct_answer });
        res.status(201).json(q);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

app.delete('/api/questions/:id', authenticateToken, isAdmin, async (req, res) => {
    await Question.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
});

// Manage Exam Settings
app.get('/api/exam-settings', authenticateToken, isAdmin, async (req, res) => {
    const settings = await ExamSettings.findOne({ where: { id: 1 } });
    res.json(settings);
});

app.put('/api/exam-settings', authenticateToken, isAdmin, async (req, res) => {
    try {
        const settings = await ExamSettings.findOne({ where: { id: 1 } });
        await settings.update(req.body);
        res.json(settings);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// Student Management (Admin)
app.get('/api/students', authenticateToken, isAdmin, async (req, res) => {
    const students = await User.findAll({ where: { role: 'student' } });
    res.json(students);
});

app.post('/api/students/invite', authenticateToken, isAdmin, async (req, res) => {
    const { email } = req.body; // Using email as username
    // Auto-generate password
    const rawPassword = Math.random().toString(36).slice(-8);

    try {
        const student = await User.create({ username: email, password_hash: rawPassword, role: 'student' });
        
        // Send email
        let info = await transporter.sendMail({
            from: '"Admin Portal" <admin@scholarlymonolith.com>',
            to: email, // This won't actually go to their inbox, it goes to Ethereal
            subject: "Your Entrance Exam Credentials",
            text: `Welcome! Your login is: ${email} and password is: ${rawPassword}. Login here: http://localhost:5173/`,
            html: `<b>Welcome!</b><br>Your login is: ${email}<br>Password is: ${rawPassword}<br><a href="http://localhost:5173/">Login to Portal</a>`,
        });

        console.log("Mock Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.status(201).json({ student, rawPassword, previewUrl: nodemailer.getTestMessageUrl(info) });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// --- STUDENT SIDE ROUTES ---
app.get('/api/exam', authenticateToken, async (req, res) => {
    if (req.user.role !== 'student') return res.sendStatus(403);
    
    const settings = await ExamSettings.findOne({ where: { id: 1 } });
    
    if (!settings.is_enabled) {
        return res.status(403).json({ message: 'Exam is currently disabled by administrator.' });
    }

    // Optional Check time window here if start_time/end_time are set

    // Hide correct answers from student payload
    const questions = await Question.findAll({
        attributes: ['id', 'text', 'options'] 
    });

    res.json({ questions, settings });
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`Server running on port ${PORT}`);
});
