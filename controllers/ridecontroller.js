const db = require('../db');
const { verifyToken, verifyDriver } = require('../middleware/authmiddleware');

// ✅ Create Ride (Only Drivers)
exports.createRide = [verifyToken, verifyDriver, (req, res) => {
  const { source, destination, start_time,  available_seats, price_per_seat, vehicle_model , license_plate } = req.body;
  const driver_id = req.user.id; // Get from JWT token

  if (!source || !destination || !start_time || !available_seats || !price_per_seat || !vehicle_model || !license_plate) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const formattedStartTime = formatDateForMySQL(start_time);
    console.log("Formatted Start Time:", formattedStartTime);
    

    const insertRideQuery = `
      INSERT INTO rides (driver_id, source, destination, start_time, available_seats, price_per_seat, vehicle_model, license_plate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertRideQuery, [driver_id, source, destination, formattedStartTime, available_seats, price_per_seat, vehicle_model, license_plate], (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res.status(500).json({ error: 'Failed to create ride', details: err });
      }
      res.status(201).json({ message: 'Ride created successfully', ride_id: result.insertId });
    });
  } catch (error) {
    console.error("Date Formatting Error:", error.message);
    res.status(400).json({ error: error.message });
  }
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

  db.query('SELECT * FROM rides WHERE ride_id = ? AND driver_id = ?', [rideId, driver_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch ride' });
    if (results.length === 0) return res.status(403).json({ error: 'Ride not found or unauthorized' });

    db.query('DELETE FROM rides WHERE ride_id = ?', [rideId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete ride' });
      res.status(200).json({ message: 'Ride deleted successfully' });
    });
  });
}];

// ✅ Format Date for MySQL
function formatDateForMySQL(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
