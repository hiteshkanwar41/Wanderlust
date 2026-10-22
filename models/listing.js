const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const { cities } = require("../constants.js");


const link="https://media.istockphoto.com/id/2173059563/vector/coming-soon-image-on-white-background-no-photo-available.jpg?s=612x612&w=0&k=20&c=v0a_B58wPFNDPULSiw_BmPyhSNCyrP_d17i2BPPyDTk="

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        filename:{
        type:String, // Cloudinary public_id
        default:"listingimage",
        },
        url:{
        type:String,
        default:link,
        // A setter runs before Mongoose saves the value to the database.
            // set: function(v) {
            //     if (v === "") {
            //         return link;
            //     }
            //     return v;
            // }
            // If the value is an empty string (""), replace it with link.
            // Otherwise, keep whatever the user entered.
            // It's equivalent to:

        set: (v) => v===""?link:v,
        }
    },
    price:{
        type:Number,
    },
   
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review",
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    //acha remember that ye bas listing ko bta ra hai ki id user object ki hai
    //agar tu koi or id bhi daalege toh vo rakhlega 
    //but jab tu .populate('owner') karega tab mongoose is id ko user mein dhundheg or agar ni milli to null return kardega owner object mein

    //new fields
    city:{
        type:String,
        enum:cities,
        // required: true,
    },
    neighbourhood: {
        type: String,
        required: true,
        trim: true,
    },
    roomType: {
        type: String,
        required: true,
        enum: [
            "Entire home/apt",
            "Private room",
            "Shared room",
            "Hotel room"
        ]
    },
    accommodates: {
        type: Number,
        required: true,
        min: 1
    },

    bathrooms: {
        type: Number,
        required: true,
        min: 0
    },

    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },

    beds: {
        type: Number,
        required: true,
        min: 1
    },
    latitude: {
        type: Number,
    },

    longitude: {
        type: Number,
    }

});

// Mongoose post middleware
// Runs after a listing is deleted using findOneAndDelete().
// If the listing exists, delete all reviews whose IDs are stored
// in the listing's `reviews` array (cascade delete).
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.reviews}});
    }
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;