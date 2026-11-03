const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
const BOOKS_FILE = path.join(__dirname, 'books.json');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: [
    'https://lexibookstore.online',
    'https://www.lexibookstore.online',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   HELPERS
========================= */

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readBooks() {
  try {
    return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/* =========================
   AUTH MIDDLEWARE
========================= */

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ ok: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ ok: false, message: "Invalid token" });
  }
}

/* =========================
   ROUTES
========================= */

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Lexibooks API running' });
});

/* =========================
   BOOKS
========================= */

app.get('/api/books', (_req, res) => {
  res.json({ ok: true, books: readBooks() });
});

/* =========================
   REGISTER
========================= */

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, message: 'All fields required' });
  }

  const users = readUsers();

  if (users.some(u => u.email === email.toLowerCase())) {
    return res.status(409).json({ ok: false, message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    name: name.trim().slice(0, 50),
    email: email.trim().toLowerCase().slice(0, 100),
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    ok: true,
    message: 'Account created',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

/* =========================
   LOGIN
========================= */

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Missing fields' });
  }

  const users = readUsers();

  const user = users.find(
    u => u.email === email.trim().toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    ok: true,
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

/* =========================
   CHECKOUT (EMAIL ORDER)
========================= */

app.post('/api/checkout', async (req, res) => {
  const { name, email, order } = req.body || {};

  if (!name || !email || !Array.isArray(order) || order.length === 0) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid order data'
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const orderText = order
    .map(i => `• ${i.title} (${i.quantity}x)`)
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // send to yourself
    subject: `New Order from ${name}`,
    html: `
      <h2>New Order</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <pre>${orderText}</pre>
      <p>${new Date().toISOString()}</p>
    `,
    text: `Name: ${name}\nEmail: ${email}\n\n${orderText}`
  };

  try {
    await transporter.sendMail(mailOptions);

    res.json({
      ok: true,
      message: 'Order placed successfully'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      message: 'Order saved but email failed'
    });
  }
});

/* =========================
   PROTECTED ROUTE EXAMPLE
========================= */

app.get('/api/profile', auth, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});