const Listing=require("../models/listing.js");
const axios = require("axios");
const instance = require("../config/razorpay");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});

    axios.get("https://airbnb-ml-0y6j.onrender.com/")
        .catch(err => console.log("Airbnb-ML warm-up:", err.message));

    const currentPage = "Home";
    res.render("listings/index.ejs", { allListings, currentPage });
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    //nested populate important
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
        return res.redirect("/listings");
    }
    //this from host is made so that we can differentiate that this req is coming from listing or hosting
    //as we have same show.ejs for both toh do diff show.wjs banane ki jagah maine ejs page tak aese info pahuncha di ki kisne bulaya hai
    //us hisaab se cheezein dikhayi jayengi
    let fromHost=false;  
    res.render("listings/show.ejs",{listing,fromHost});
    
    
}

module.exports.createOrder= async(req,res)=>{
     try {
        let {id}=req.params;
   
    const listing=await Listing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    const { booking } = req.body;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    const conversion = await axios.get("https://api.frankfurter.dev/v2/rate/USD/INR")
    const conversionRate=conversion.data.rate;
    let amount=Number((nights * listing.price * conversionRate).toFixed(2));
    var options = {
        amount: amount * 100,  // Amount is in currency subunits. 
        currency: "INR",
        receipt: `ord_${Date.now()}`
    };
    
    const order = await instance.orders.create(options);
    req.session.razorpayOrderId = order.id;
    req.session.conversionRate = conversionRate;
    
    // Store the Razorpay Order ID in the session so we can use the
    // original server-generated order ID during signature verification
    // instead of trusting the order ID sent by the client.
    res.json(order);
    } catch (err) {
        console.error(err);   // <-- IMPORTANT
        next(err);
    }
}