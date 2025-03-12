const express = require('express');
const router = express.Router();
const rideController = require('../controllers/ridecontroller');
const { verifyToken, verifyDriver } = require('../middleware/authmiddleware');
const { route } = require('./auth');

// ✅ Route to create a new ride
router.post('/rides', verifyToken, verifyDriver, rideController.createRide);

// ✅ Route to get all rides
router.get('/', rideController.getAllRides);

// ✅ Route to get a specific ride
router.get('/:id', rideController.getRideById);

// ✅ Route to delete a ride
router.delete('/:id', rideController.deleteRide);

router.get('/test', (req, res) => {
    res.send('Rides route is working!');
  });
  

module.exports = router;
