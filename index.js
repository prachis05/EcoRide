const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const rideRoutes = require("./routes/rides");

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.log("Database Connection Failed", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});

// Routes
app.use("/api", authRoutes);
console.log("Rides loading")
app.use("/api/rides", rideRoutes);



// Sample Route
app.get("/", (req, res) => {
    res.send("Ecoride API is Running");
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
