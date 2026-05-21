const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:5001',
    process.env.FRONTEND_URL || 'https://shravanweb-expence-tracker.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mock Databases
const users = [];
const transactions = [];

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'YOUR_SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.send('Expense - Tracker Backend is running!');
});

// TRANSACTIONS ROUTES
app.get('/api/transactions', authenticateToken, (req, res) => {
  const userTransactions = transactions.filter(t => t.userId === req.user.userId);
  res.json(userTransactions);
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const { type, amount, category, description, transaction_date } = req.body;
  const newTransaction = {
    id: Date.now().toString(),
    userId: req.user.userId,
    type,
    amount,
    category,
    description,
    transaction_date,
    created_at: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = transactions.findIndex(t => t.id === id && t.userId === req.user.userId);
  if (index === -1) return res.status(404).json({ message: 'Transaction not found' });
  
  transactions.splice(index, 1);
  res.json({ message: 'Transaction deleted' });
});

// SIGNUP ROUTE
app.post('/api/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = jwt.sign({ email }, 'YOUR_SECRET_KEY', { expiresIn: '1d' });

  const newUser = { 
    id: Date.now(), 
    fullName, 
    email, 
    password: hashedPassword, 
    isVerified: false, 
    verificationToken 
  };
  users.push(newUser);

  // Send Verification Email
  const verificationLink = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/verify?token=${verificationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm Your Email - Expense - Tracker',
    html: `
      <h1>Welcome to Expense - Tracker, ${fullName}!</h1>
      <p>Please click the link below to confirm your email and activate your account:</p>
      <a href="${verificationLink}" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Confirm Email</a>
      <p>If the button doesn't work, copy this link: ${verificationLink}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Signup successful! Please check your email to verify your account.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(201).json({ message: 'Signup successful, but we could not send the verification email.' });
  }
});

// VERIFY EMAIL ROUTE
app.get('/api/verify', (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, 'YOUR_SECRET_KEY');
    const user = users.find(u => u.email === decoded.email);
    
    if (!user) return res.status(400).send('<h1>Invalid Link</h1>');
    
    user.isVerified = true;
    user.verificationToken = null;
    
    res.send('<h1>Email Verified!</h1><p>Your account is now active. You can close this and go back to the app to sign in.</p>');
  } catch (error) {
    res.status(400).send('<h1>Link Expired or Invalid</h1>');
  }
});

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(401).json({ message: 'Please verify your email first! Check your inbox for the link.' });
  }

  const token = jwt.sign({ userId: user.id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
