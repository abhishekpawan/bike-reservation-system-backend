const asyncHandler = require("express-async-handler");
const Bike = require("../models/bikeModel");
const Review = require("../models/reviewModel");

// @desc Create new Review
// @route POST /reviews/create/:id
// @access Private
const createReview = asyncHandler(async (req, res) => {
  const review = new Review({
    name: req.user.name,
    email: req.user.email,
    avgRating: req.body.avgRating,
    review: req.body.review,
    userId: req.user._id,
    bikeId: req.params.id,
  });
  console.log(req.body);
  console.log(review);
  try {
    //setting the avgRating of the bike accordidng to all the avaialable reviws + new added review
    const reviewdBike = await Bike.findById(req.params.id)
    const allReviewsOfBike = await Review.find({bikeId:req.params.id})
    let totalRating = 0
    for(let i=0; i<allReviewsOfBike.length; i++){
      totalRating = totalRating + allReviewsOfBike[i].avgRating
    }
    const avgRatingOfBike =  (totalRating+req.body.avgRating)/(allReviewsOfBike.length+1)

    reviewdBike.avgRating = parseFloat(avgRatingOfBike).toFixed(1)
    await reviewdBike.save()

    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(400).send({error});
  }
});

// @desc get a particular Review
// @route GET /reviews/:id
// @access Private
const getReview = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  try {
    const review = await Review.findOne({ _id, owner: req.user._id });
    if (!review) {
      res.status(404).send({ error: "Review not found!" });
    }
    res.status(200).send(review);
  } catch (error) {
    res.status(500).send();
  }
});

// @desc Get all Reviews of a User on a bike
// @route GET /reviews/all/:id
// @access Private
// GET /review/?avgRating>=3
// GET /Reviews/(number of request per page )&skip=20(number of items skiped to jump on next page)
// GET /Reviews/?sortBy=createdAt:asc/desc
const getReviews = asyncHandler(async (req, res) => {
  const sort = {};

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    if (req.query.avgRating) {
      const reviews = await Review.find({
        bikeId: req.params.id,
      });
      const filteredReviews = reviews.filter((review) => {
        return review.avgRating >= parseInt(req.query.avgRating);
      });

      if (filteredReviews.length === 0) {
        return res.status(200).send({ msg: "No Reviews available!" });
      }
      return res.status(200).send(filteredReviews);
    }

    const totalPage = Math.ceil(
      (await Review.find({
        bikeId: req.params.id,
      })).length / parseInt(req.query.limit)
    );
    const currentPage =
      parseInt(req.query.skip) === 0
        ? 1
        : parseInt(req.query.skip) / parseInt(req.query.limit) + 1;
    const review = await Review.find({
      bikeId: req.params.id,
    })
      .limit(req.query.limit)
      .skip(req.query.skip)
      .sort(sort);
    if (review.length === 0) {
      return res.status(200).send({ msg: "No Reviews available!" });
    }
    res.status(200).send({review, totalPage,currentPage });
  } catch (error) {
    res.status(500).send({error});
  }
});

module.exports = {
  createReview,
  getReview,
  getReviews
};
