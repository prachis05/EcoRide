const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const checkUser = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUser, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const insertUser = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertUser, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

// Login User
exports.login = (req, res) => {
  const { email, password } = req.body;

  const findUser = 'SELECT * FROM users WHERE email = ?';
  db.query(findUser, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
};
