const asyncHandler = require("express-async-handler");
const Bike = require("../models/bikeModel");
const User = require("../models/userModel");

// @desc Create new Bike
// @route POST /bikes/create
// @access Private
const createBike = asyncHandler(async (req, res) => {
  const bike = new Bike({
    ...req.body,
    // image:req.file.buffer
    // owner:req.user._id
  });
  try {
    await bike.save();
    res.status(201).send(bike);
  } catch (error) {
    res.status(400).send({ error });
  }
});

// @desc get a particular Bike
// @route GET /bike/:id
// @access Private
const getBike = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  try {
    const bike = await Bike.findOne({ _id, owner: req.user._id });
    if (!bike) {
      res.status(404).send({ error: "Bike not found!" });
    }
    res.status(200).send(bike);
  } catch (error) {
    res.status(500).send({ error });
  }
});

// @desc Get all Bikes
// @route GET /bikes/
// @access Private
// GET /bikes/?avgRating>=3
// GET /bike/?isAvailable=false
// GET /bikes/(number of request per page )&skip=20(number of items skiped to jump on next page)
// GET /bikes/?sortBy=createdAt:asc/desc
const getBikes = asyncHandler(async (req, res) => {
  const bookingStatus = {};
  const sort = {};
  if (req.query.isAvailable) {
    bookingStatus.isAvailable = req.query.isAvailable === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    //search bikes according to model and location and color
    if (req.query.search) {
      
      const searchedBikesFullList = await Bike.find({
       "$or": [
          { model:{$regex:req.query.search}  },
          { color:{$regex:req.query.search}  },
          { location:{$regex:req.query.search}  },
        ],
      });

      const totalPage = Math.ceil(
        searchedBikesFullList.length / parseInt(req.query.limit)
      );
      const currentPage =
        parseInt(req.query.skip) === 0
          ? 1
          : parseInt(req.query.skip) / parseInt(req.query.limit) + 1;

      const searchedBikes = await Bike.find({
        ...bookingStatus,
        "$or": [
           { model:{$regex:req.query.search}  },
           { color:{$regex:req.query.search}  },
           { location:{$regex:req.query.search}  },
         ],
       })
       .limit(req.query.limit)
        .skip(req.query.skip)
        .sort(sort);;



      if (searchedBikes.length === 0) {
        return res.status(200).send({ msg: "No bikes available!" });
      }
      res.status(200).send({ bike: searchedBikes,totalPage,currentPage });
    }

    
    //filtering bikes according to avgRating
    if (req.query.avgRating) {
      //calculating total pages of filtered bikes by avg rating
      const bikes1 = await Bike.find({
        ...bookingStatus,
      });
      const filteredBikesByAvgRating = bikes1.filter((bike) => {
        return bike.avgRating >= parseInt(req.query.avgRating);
      });

      const totalPage = Math.ceil(
        filteredBikesByAvgRating.length / parseInt(req.query.limit)
      );
      const currentPage =
        parseInt(req.query.skip) === 0
          ? 1
          : parseInt(req.query.skip) / parseInt(req.query.limit) + 1;

      //filtering bikes according to avgRating
      const bikes2 = await Bike.find({
        ...bookingStatus,
      })
        .limit(req.query.limit)
        .skip(req.query.skip)
        .sort(sort);

      const filteredBikes = bikes2.filter((bike) => {
        return bike.avgRating >= parseInt(req.query.avgRating);
      });

      if (filteredBikes.length === 0) {
        return res.status(200).send({ msg: "No Bikes available!" });
      }

      return res
        .status(200)
        .send({ bike: filteredBikes, totalPage, currentPage });
    }

    //calculating total pages of bikes
    const totalPage = Math.ceil(
      (await Bike.find()).length / parseInt(req.query.limit)
    );
    const currentPage =
      parseInt(req.query.skip) === 0
        ? 1
        : parseInt(req.query.skip) / parseInt(req.query.limit) + 1;

    const bike = await Bike.find({
      ...bookingStatus,
    })
      .limit(req.query.limit)
      .skip(req.query.skip)
      .sort(sort);
    if (bike.length === 0) {
      return res.status(200).send({ msg: "No bikes available!" });
    }
    res.status(200).send({ bike, totalPage, currentPage });
  } catch (error) {
    res.status(500).send({ error });
  }
});

// @desc update bike
// @route PATCH /api/bike/:id
// @access Private
const updateBike = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "model",
    "color",
    "location",
    "isAvailable",
    "avgRating",
    "image",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    const bike = await Bike.findOne({ _id, owner: req.user._id });
    if (!bike) {
      return res.status(404).send({ error: "Bike not found!" });
    }
    updates.forEach((update) => (bike[update] = req.body[update]));
    await bike.save();
    res.status(200).send(bike);
  } catch (error) {
    res.status(400).send({ error });
  }
});

// @desc Delete bike
// @route DELETE /api/bike/:id
// @access Private
const deleteBike = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  try {
    const bike = await Bike.findOneAndDelete({ _id, owner: req.user._id });
    if (!bike) {
      return res.status(404).send({ error: "Bike not found!" });
    }
    res.status(200).send({ bike, msg: "Bike succesfully deleted" });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = {
  createBike,
  getBike,
  getBikes,
  deleteBike,
  updateBike,
};
