const express = require("express");
const router = express.Router();
const {
 createReview,
 getReview,
 getReviews
} = require("../controllers/reviewController");
const {protect} = require('../middleware/authMiddleware')

router.post("/create/:id", protect, createReview);
router.get("/all/:id", protect, getReviews);
router.get("/:id", protect, getReview)


module.exports = router;
