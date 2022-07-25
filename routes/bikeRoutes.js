const express = require("express");
const router = express.Router();
const {
 createBike,
 getBike,
 getBikes,
 deleteBike,
 updateBike,
} = require("../controllers/bikeController");
const {protect} = require('../middleware/authMiddleware')

router.post("/create", protect, createBike);
router.get("/", protect, getBikes);
router.get("/:id", protect, getBike);
router.delete("/:id", protect, deleteBike);
router.patch("/:id", protect, updateBike);


module.exports = router;
