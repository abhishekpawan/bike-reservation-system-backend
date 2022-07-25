const express = require("express");
const router = express.Router();
const {
 bookingBike,
 getAllBookedBikes,
 updateBookedBike,
 deleteBookedBike
} = require("../controllers/bookedBikeController");
const {protect} = require('../middleware/authMiddleware')

router.post("/:id",protect,bookingBike)
router.get("/all",protect,getAllBookedBikes)
router.patch("/:id", protect, updateBookedBike);
router.delete("/:id", protect, deleteBookedBike);


module.exports = router;
