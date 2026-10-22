const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const Booking=require("../models/booking.js");
const {listingSchema}=require("../schemas/Schema.js");
let {isLoggedIn,isOwner,validateListing,validateBooking,isLoggedInAjax}=require("../middlewear.js");
let ExpressError=require("../utils/ExpressError.js");
const instance = require("../config/razorpay");
const axios = require("axios");

const listingController=require("../controllers/listing.js");

//Index Route
router.get("/",wrapAsync(listingController.index));

router.get("/booking",
    isLoggedIn,
    async(req,res)=>{
    if(req.user){
        let id=req.user._id;
        let bookings=await Booking.find({guest:id}).populate("listing");
        const today = new Date();
        today.setHours(0,0,0,0);

        const info={
            totalBookings: bookings.length,

            upcomingStays:bookings.filter((booking)=>{
               
                return booking.checkIn > today
            }).length,

            currentStays: bookings.filter((booking) =>{ 
                return booking.checkIn <= today &&
                booking.checkOut >= today
            }).length,

            completedTrips:bookings.filter((booking)=>{
                return booking.checkOut < today 
            }).length,

            totalSpent:bookings.reduce((sum,booking)=>{
                return sum + booking.totalPrice
            },0).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
        }

        filter=req.query.filter;
        query={
            guest:req.user._id
        }
        
        if(filter === "current"){
            query.checkIn = { $lte: today };
            query.checkOut = { $gte: today };
        }

        if(filter === "upcoming"){
           query.checkIn = { $gt: today };
        }

        else if(filter === "completed"){
            query.checkOut = { $lt: today };
        }

        

        const filterdBookings = await Booking.find(query).populate("listing");
        const currentPage="Mybookings";
        res.render("listings/bookings.ejs",{bookings:filterdBookings,filter,info,currentPage});
    }
});

//Show Route
router.get("/:id",wrapAsync(listingController.showListing));

router.post("/:id/create-order",
    isLoggedInAjax,
    validateBooking,
   wrapAsync(listingController.createOrder)
);



module.exports=router;