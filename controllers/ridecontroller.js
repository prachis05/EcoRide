const db = require('../db');
const { verifyToken, verifyDriver } = require('../middleware/authMiddleware');

// ✅ Create Ride (Only Drivers)
exports.createRide = [verifyToken, verifyDriver, (req, res) => {
  const { source, destination, start_time, end_time, available_seats, status } = req.body;
  const driver_id = req.user.id; // Get from JWT token

  if (!source || !destination || !start_time || !available_seats) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const insertRideQuery = `
    INSERT INTO rides (driver_id, source, destination, start_time, end_time, available_seats, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(insertRideQuery, [driver_id, source, destination, start_time, end_time, available_seats, status || 'Scheduled'], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create ride' });

    res.status(201).json({ message: 'Ride created successfully', ride_id: result.insertId });
  });
}];

// ✅ Get All Rides (Public)
exports.getAllRides = (req, res) => {
  db.query('SELECT * FROM rides', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch rides' });
    res.status(200).json(results);
  });
};

// ✅ Get Ride by ID (Public)
exports.getRideById = (req, res) => {
  const rideId = req.params.id;
  db.query('SELECT * FROM rides WHERE ride_id = ?', [rideId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch ride' });
    if (results.length === 0) return res.status(404).json({ error: 'Ride not found' });
    res.status(200).json(results[0]);
  });
};

// ✅ Delete Ride (Only Drivers who created the ride)
exports.deleteRide = [verifyToken, verifyDriver, (req, res) => {
  const rideId = req.params.id;
  const driver_id = req.user.id;

  // Check if ride belongs to the driver
  db.query('SELECT * FROM rides WHERE ride_id = ? AND driver_id = ?', [rideId, driver_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch ride' });
    if (results.length === 0) return res.status(403).json({ error: 'Ride not found or unauthorized' });

    // Delete Ride
    db.query('DELETE FROM rides WHERE ride_id = ?', [rideId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to delete ride' });
      res.status(200).json({ message: 'Ride deleted successfully' });
    });
  });
}];
