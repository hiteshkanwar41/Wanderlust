const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const {reviewSchema}=require("../schemas/Schema.js");
let {isLoggedIn,isAuthor,isNotOwner,validateReview}=require("../middlewear.js");
let ExpressError=require("../utils/ExpressError.js")

const reviewController=require("../controllers/review.js")



//POST review route
router.post("/",
    isLoggedIn,
    isNotOwner,
    validateReview,
    wrapAsync(reviewController.createReview));


//Delete Route
router.delete("/:reviewId",
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports=router;