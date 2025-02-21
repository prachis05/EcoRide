const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
require("dotenv").config();

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Register User
// Register User
exports.register = (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  // Check if user already exists
  const checkUser = "SELECT * FROM users WHERE email = ?";
  db.query(checkUser, [email], async (err, result) => {
    if (err) {
      console.error("Database error during user check:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    try {
      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert User
      const insertUser = "INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(insertUser, [name, email, hashedPassword, phone, address, role], (err) => {
        if (err) {
          console.error("Error inserting user into DB:", err.sqlMessage || err);
          return res.status(500).json({ error: "User registration failed" });
        }
        res.status(201).json({ message: "User registered successfully" });
      });
    } catch (hashErr) {
      console.error("Error hashing password:", hashErr);
      res.status(500).json({ error: "Password hashing failed" });
    }
  });
};


// Login User
// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const findUser = "SELECT * FROM users WHERE email = ?";
  db.query(findUser, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!result || result.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result[0];

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  });
};

