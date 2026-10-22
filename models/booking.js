
const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const bookingSchema=new Schema({
    listing:{
         type:Schema.Types.ObjectId,
         ref:"Listing",
         required:true
    },
    guest:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    guests:{
        type:Number,
        min:1,
        required: true,

    },
    checkIn:{
        type:Date,
        required:true
    },
    checkOut:{
        type:Date,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true,
        min: 0
    },
    status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed"],
    default: "confirmed"
    }
    
}, {
    timestamps: true
});
// timestamps is a Mongoose feature that automatically keeps track of when a document was created and last updated.
const Booking=mongoose.model("Booking",bookingSchema);


module.exports=Booking;