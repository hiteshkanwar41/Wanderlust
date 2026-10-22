const Listing=require("../models/listing.js"); 
const axios = require('axios');

module.exports.fetchOverviewData=async (req, res) => {
    try {
        // The server (Node) talks to the server (Flask)
        // Browsers don't block server-to-server communication!
        const result = await axios.get("https://airbnb-ml-0y6j.onrender.com/overview",
        {
            params: req.query
        });
        res.json(result.data); 
    } catch (error) {
        console.error("Error connecting to Flask:", error.message);
        res.status(500).json({ error: "Could not fetch analytics" });
    }
}

module.exports.fetchAnalyticsFilters=async(req,res)=>{
        result=await axios.get("https://airbnb-ml-0y6j.onrender.com/filters",{
        params: req.query
    })
         res.json(result.data); 
         
}

module.exports.fetchAiInsights=async(req,res)=>{
 
     listing=await Listing.findById(req.body.listingId)
    const price_predictionData = {
        city: listing.city,
        neighbourhood_cleansed: listing.neighbourhood,
        room_type: listing.roomType,
        accommodates: listing.accommodates,
        bathrooms: listing.bathrooms,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        latitude: listing.latitude,
        longitude: listing.longitude
    };
    const occupancy_prdictionData={
        city: listing.city,
        neighbourhood_cleansed: listing.neighbourhood,
        room_type: listing.roomType,
        accommodates: listing.accommodates,
        bathrooms: listing.bathrooms,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        latitude: listing.latitude,
        longitude: listing.longitude,
        price:listing.price,
        number_of_reviews:listing.reviews?.length+30 || 0
    }
        const result = await axios.post(
        "https://airbnb-ml-0y6j.onrender.com/predict",{
            "priceData":price_predictionData,
            "occupancyData":occupancy_prdictionData
        }
    );
         res.json({
            predictedPrice: result.data.predicted_price,
            predictedOccupancy:result.data.predicted_occupancy,
            currPrice: listing.price
        });

}
