const express=require("express");
const router=express.Router()
const axios = require('axios');
const mongoose=require("mongoose");
const Listing=require("../models/listing.js"); 
const wrapAsync=require("../utils/wrapAsync.js");
const apiController=require("../controllers/api.js")

router.get("/analytics/overview", wrapAsync(apiController.fetchOverviewData));

router.get("/analytics/overview/filters",wrapAsync(apiController.fetchAnalyticsFilters));

router.post("/analytics/aiInsights",wrapAsync(apiController.fetchAiInsights));

module.exports=router;