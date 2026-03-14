const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview,isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js")



//ROUTES FOR REVIEW--------------
//POST REVIEW ROUTE---------------------------
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.postReview));

//DELETE REVIEW ROUTE-------------------------------
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,
     wrapAsync(reviewController.deleteReview));

module.exports = router;
