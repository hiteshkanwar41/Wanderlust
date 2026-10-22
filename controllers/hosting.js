const Listing=require("../models/listing.js");
let ExpressError=require("../utils/ExpressError.js")
const cloudinary=require("../api/cloudinary.js");
const Booking=require("../models/booking.js");
const axios = require("axios");

module.exports.home=async(req,res)=>{
    const listings = await Listing.find({ owner: req.user._id }).populate("reviews");

    axios.get("https://airbnb-ml-0y6j.onrender.com/")
    .catch(err => console.log("Airbnb-ML warm-up:", err.message));
    
    let totalRating = 0;
    let totalReviews = 0;

    listings.forEach(listing => {
        listing.reviews.forEach(review => {
            totalRating += review.rating;
            totalReviews++;
        });
    });

    const avgRating = totalReviews
        ? Number((totalRating / totalReviews).toFixed(1))
        : 0;
    
    const listings_id=listings.map((listing)=>{
        return listing._id;
    })
    const bookings=await Booking.find({listing:{$in:listings_id}})
    .populate({path:"listing",
        populate:{
            path:"reviews"
        }
    });
     const info={
            totalBookings: bookings.length,

            totalEarnings:bookings.reduce((sum,booking)=>{
                return sum + booking.totalPrice
            },0).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }),
            avgRating:avgRating,
            totalReviews:totalReviews
            
        }
   
        
        const today = new Date();
        today.setHours(0,0,0,0);
        filter=req.query.filter;
        query={
            listing:{$in:listings_id}
        }
        
        if(!filter){
            query.checkIn = { $lte: today };
            query.checkOut = { $gte: today };
        }

        if(filter === "upcoming"){
           query.checkIn = { $gt: today };
        }

        else if(filter === "completed"){
            query.checkOut = { $lt: today };
        }

        

    const filterdBookings = await Booking.find(query).populate("listing").populate("guest");;
    let currentPage="Home";
    res.render("hosting/home.ejs",{currentPage,bookings:filterdBookings,info,filter});
}

module.exports.renderListings=async(req,res)=>{
        // .sort({ createdAt: -1 })
        //Sort the listings (newest first):
        // Sorts the retrieved documents in descending order by their creation date 
        // (meaning the newest items/posts appear first)

        const mylistings=await Listing.find({owner: req.user._id}).sort({ createdAt: -1 });
        let currentPage="Listing"
        res.render("hosting/listing.ejs",{mylistings,currentPage});
}

module.exports.renderAnalytics= (req,res)=>{
    let currentPage="Analytics"
    let subPage=""
    res.render("hosting/analytics.ejs",{currentPage,subPage});
}
module.exports.renderOverview= (req,res)=>{
    let currentPage="Analytics"
    let subPage="Overview"
    res.render("hosting/overview.ejs",{currentPage,subPage});
}
module.exports.renderAiInsights= async (req,res)=>{
    let currentPage="Analytics"
    let subPage="aiInsights"
    const mylistings=await Listing.find({owner: req.user._id}).sort({ createdAt: -1 });
    res.render("hosting/aiInsights.ejs",{currentPage,subPage,mylistings});
}


module.exports.renderNewForm=async(req,res)=>{
    let currentPage="Add listing"
    let subPage=""
    res.render("hosting/new.ejs",{currentPage,subPage});
}
// with using req.file and uploader of cloudinary
// const fs = require("fs");

// module.exports.createListing=async(req,res)=>{
//     if (!req.file) {
//     req.flash("error", "Please upload an image.");
//     return res.redirect("/hosting/new");
//     }
    
//     const result=await cloudinary.uploader.upload(req.file.path,{
//             asset_folder:"Wanderlust",
//             resource_type:"image",
//             overwrite: false,
    
//     });

//     // Delete the temporary file created by Multer
//     fs.unlinkSync(req.file.path);
    
    
//     let listing= new Listing(req.body.listing);
//     listing.owner=req.user._id;
//     listing.image.filename=result.public_id;
//     listing.image.url=result.secure_url;
    
//     await listing.save();
    
//     req.flash("success","New Listing Created!");
//     res.redirect("/hosting/listing");

// }

//now direcly uploading to cloudinary from form so no need here
module.exports.createListing = async (req, res) => {
    // console.log(req.body);
    // console.log(req.body?.listing);
    const listing = new Listing(req.body.listing);

    listing.owner = req.user._id;

    await listing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/hosting/listing");

};


module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id)
    .populate({
        path:"reviews",
    populate:{
        path:"author"
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","listing you requested does not exist!"); 
        //if you don,t write return here app crashes as route will try to send two responses.
        //either you can return or use else statement return is preferred.
        return res.redirect("/hosting/listing");
    }
    let currentPage=""
    let subPage=""
    const fromHost=true;
    res.render("listings/show.ejs",{listing,fromHost,currentPage,subPage});
    
    
}
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested does not exist!"); 
        return res.redirect("/hosting/listing");
    }
    let currentPage=""
    let subPage=""
    res.render("hosting/edit.ejs",{listing,currentPage,subPage});
}
module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing},{runValidators: true});
    req.flash("success","Listing Updated!");
    res.redirect(`/hosting/${id}`);
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    
    if (deletedListing.image.filename !== "listingimage") {
        await cloudinary.uploader.destroy(deletedListing.image.filename);
    }
    
    req.flash("success", "Listing Deleted!");
    res.redirect("/hosting/listing");
}

module.exports.deletImg=async(req,res)=>{
    let {public_id}=req.body;
    const result=await cloudinary.uploader.destroy(public_id);
    res.json(result);
}