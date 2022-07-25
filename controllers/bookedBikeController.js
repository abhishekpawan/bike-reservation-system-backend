const asyncHandler = require("express-async-handler");
const Bike = require("../models/bikeModel");
const BookedBike = require("../models/bookedBikeModel");

// // @desc Create new Bike
// // @route POST /bikes/create
// // @access Private
// const createBike = asyncHandler(async (req, res) => {
//   const bike = new Bike({
//     ...req.body,
//     // owner:req.user._id
//   });
//   try {
//     await bike.save();
//     res.status(201).send(bike);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// // @desc get a particular Bike
// // @route GET /bike/:id
// // @access Private
// const getBike = asyncHandler(async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const bike = await Bike.findOne({ _id, owner: req.user._id });
//     if (!bike) {
//       res.status(404).send({ error: "Bike not found!" });
//     }
//     res.status(200).send(bike);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

// // @desc Get all Bikes
// // @route GET /bikes/
// // @access Private
// // GET /bike/?isAvailable=false
// // GET /bikes/(number of request per page )&skip=20(number of items skiped to jump on next page)
// // GET /bikes/?sortBy=createdAt:asc/desc
// const getBikes = asyncHandler(async (req, res) => {
//   const bookingStatus = {};
//   const sort = {};
//   if (req.query.isAvailable) {
//     bookingStatus.isAvailable = req.query.isAvailable === "true";
//   }
//   if (req.query.sortBy) {
//     const parts = req.query.sortBy.split(":");
//     sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
//   }
//   try {
//     const bike = await Bike.find({
//       ...bookingStatus,
//     })
//       .limit(req.query.limit)
//       .skip(req.query.skip)
//       .sort(sort);
//     if (bike.length === 0) {
//       return res.status(200).send({ msg: "No bikes available!" });
//     }
//     res.status(200).send(bike);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

// @desc booking of Bike by an User
// @route POST /bookedBikes/:id
// @access Private
const bookingBike = asyncHandler(async (req, res) => {
  const bikeId = req.params.id;

  try {
    const bikeToBeBooked = await Bike.findById(bikeId);
    if (!bikeToBeBooked) {
      return res.status(404).send({ error: "Bike not found!" });
    }
    if (bikeToBeBooked.isAvailable === false) {
      return res
        .status(400)
        .send({ error: "bike is not avaialble for booking" });
    }

    bikeToBeBooked.isAvailable = false;
    await bikeToBeBooked.save();

    const bookedBike = new BookedBike({
      model: bikeToBeBooked.model,
      color: bikeToBeBooked.color,
      isAvailable: false,
      avgRating: bikeToBeBooked.avgRating,
      bookingStatus: "booked",
      bikeId: bikeToBeBooked._id,
      bookedBy: req.user._id,
      image: bikeToBeBooked.image,
    });
    await bookedBike.save();
    res.status(200).send(bookedBike);
  } catch (error) {
    res.status(500).send();
  }
});

// @desc get all Bike booked by an User
// @route GET /bookedBikes/all
// @access Private
// GET /bookedBikes/all?isAvailable=false
// GET /bookedBikes/all(number of request per page )&skip=20(number of items skiped to jump on next page)
// GET /bookedBikes/all?sortBy=createdAt:asc/desc
const getAllBookedBikes = asyncHandler(async (req, res) => {
  const bookedStatus = {};
  const sort = {};

  if (req.query.isAvailable) {
    bookedStatus.isAvailable = req.query.isAvailable === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    const bookedBike = await BookedBike.find({
      ...bookedStatus,
      bookedBy: req.user._id,
    })
      .limit(req.query.limit)
      .skip(req.query.skip)
      .sort(sort);
    res.status(200).send(bookedBike);
  } catch (error) {
    res.status(500).send();
  }
});

// @desc updating booking status of Bike booked by an User
// @route PATCH /:id
// @access Private
const updateBookedBike = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["bookingStatus", "isAvailable"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    const bookedBike = await BookedBike.findOne({
      _id,
      bookedBy: req.user._id,
    });
    if (!bookedBike) {
      return res.status(404).send({ error: "Bike not found!" });
    }
    updates.forEach((update) => (bookedBike[update] = req.body[update]));
    await bookedBike.save();

    const bikeToBeBooked = await Bike.findById(bookedBike.bikeId);
    if (!bikeToBeBooked) {
      return res.status(404).send({ error: "Bike not found!" });
    }
    bikeToBeBooked.isAvailable = true;
    await bikeToBeBooked.save();

    res.status(200).send(bookedBike);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @desc Delete bike
// @route DELETE /bookedBike/:id
// @access Private
const deleteBookedBike = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  try {
    const bike = await Bike.findOneAndDelete({ _id, bookedBy: req.user._id });
    if (!bike) {
      return res.status(404).send({ error: "Bike not found!" });
    }
    res.status(200).send({ bike, msg: "Bike succesfully deleted" });
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = {
  bookingBike,
  getAllBookedBikes,
  updateBookedBike,
  deleteBookedBike,
};
