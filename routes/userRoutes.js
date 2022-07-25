const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const {protect} = require('../middleware/authMiddleware')

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/",protect, getUsers);
router.put('/:id',protect,updateUser)
router.delete('/:id',protect, deleteUser)

module.exports = router;
