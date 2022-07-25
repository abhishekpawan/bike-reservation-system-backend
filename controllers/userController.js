const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Register new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password} = req.body;

  if (!name || !email || !password ) {
    res.status(400).send({error:"Please add all feilds"});
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).send({error:'Email already exists!'});
  }

  // Hash the passowrd
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role:'user',
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).send({error:"Invalid User Data"});
  }
});

// @desc Authenticate a user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).send({error:"Invalid credentials"});
  }
});

// @desc Get all Users
// @route GET /api/users/
// @access Private
const getUsers = asyncHandler(async (req, res) => {
  const allUser = await User.find();

  res.status(200).json(allUser);
});

// @desc Get User data
// @route GET /api/users/me
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  console.log(req.params.id);
  try {
    const user = await User.findById({ _id });
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send();
  }
});


// @desc Update user data
// @route PUT /api/users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(400).send({error:"User not found"});
  }

  await user.remove()
  res.status(200).json({id:req.params.id});
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  deleteUser,
  updateUser,
};
