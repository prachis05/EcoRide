const express = require('express');
const router = express.Router();
const rideController = require('../controllers/ridecontroller');

// ✅ Route to create a new ride
router.post('/rides', rideController.createRide);

// ✅ Route to get all rides
router.get('/', rideController.getAllRides);

// ✅ Route to get a specific ride
router.get('/:id', rideController.getRideById);

// ✅ Route to delete a ride
router.delete('/:id', rideController.deleteRide);

module.exports = router;
