
var instance = require("../config/razorpay");
const crypto=require("crypto")
const Listing=require("../models/listing.js");
const Booking=require("../models/booking.js");


module.exports.verifyPayment=async(req,res)=>{
   try{
    if(!req.session.razorpayOrderId){
        return res.status(400).json({
            success: false,
            message: "Order not found in session."
        });
    }

    // Generate signature using the original server-generated order ID
    const generated_signature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
     .update(
                req.session.razorpayOrderId +
                "|" +
                req.body.razorpay_payment_id
            )
    .digest("hex");


      // Verify payment signature
        if (generated_signature !== req.body.razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

        const listing = await Listing.findById(req.body.listingId);

         if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found."
            });
        }

        const checkIn = new Date(req.body.booking.checkIn);
        const checkOut = new Date(req.body.booking.checkOut);

        const nights = Math.ceil(
            (checkOut-checkIn) / (1000*60*60*24)
        );
        
        const totalPrice = Number((nights * listing.price * req.session.conversionRate).toFixed(2));

         const booking = new Booking({
            listing: listing._id,
            guest: req.user._id,
            guests: req.body.booking.guests,
            checkIn,
            checkOut,
            totalPrice
        });

         await booking.save();
        
         // Remove stored order ID
        delete req.session.razorpayOrderId;
        delete req.session.conversionRate;

        res.json({
            success: true,
            message: "Payment verified and booking confirmed.",
            redirectUrl: `/listings/booking`
        });


    }
   catch(err){
    console.error(err);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    
   }
}

