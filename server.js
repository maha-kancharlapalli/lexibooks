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
const JWT_SECRET = process.env.JWT_SECRET || 'lexibooks-demo-secret';

app.use(cors({
  origin: [
    'https://lexibooks.store',
    'https://www.lexibooks.store'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(__dirname));

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Lexibooks auth API is running' });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, message: 'Name, email and password are required.' });
  }

  const users = readUsers();
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ ok: false, message: 'An account with that email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    ok: true,
    message: 'Account created successfully.',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }

  const users = readUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    ok: true,
    message: 'Signed in successfully.',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.post('/api/checkout', async (req, res) => {
  const { name, email, order } = req.body || {};

  if (!name || !email || !order || !Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ ok: false, message: 'Name, email, and order items are required.' });
  }

  // Create email transporter (using Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Format order details
  const orderDetails = order.map(item => `• ${item.title} (${item.quantity}x)`).join('\n');

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'seoah.baek@gmail.com',
    subject: `New Lexibooks Order from ${name}`,
    html: `
      <h2>New Lexibooks Order</h2>
      <p><strong>Customer Name:</strong> ${name}</p>
      <p><strong>Customer Email:</strong> ${email}</p>
      <h3>Order Details:</h3>
      <pre>${orderDetails}</pre>
      <p>Order placed on: ${new Date().toISOString()}</p>
    `,
    text: `New Lexibooks Order\n\nCustomer Name: ${name}\nCustomer Email: ${email}\n\nOrder Details:\n${orderDetails}\n\nOrder placed on: ${new Date().toISOString()}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({
      ok: true,
      message: 'Order submitted successfully! A confirmation email has been sent.',
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Order submitted, but there was an issue sending the confirmation email.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Lexibooks auth server running on http://localhost:${PORT}`);
});
