const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
let {isLoggedIn,isOwner,hasListing,validateListing}=require("../middlewear.js");
const hostingController=require("../controllers/hosting.js")
let ExpressError=require("../utils/ExpressError.js")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const cloudinary=require("../api/cloudinary.js");



// In Express.js, router.route() is a method used to chain multiple HTTP request handlers for a specific route path.

// Instead of repeating the path name for different HTTP verbs (like GET, POST, PUT, DELETE), 
// router.route(path) returns an instance of a single route.

router
.route("/")
//index page
.get(
    isLoggedIn,
    hasListing,
    hostingController.home
)
// Create route
.post(
    isLoggedIn,
    //MULTER AS FORM ENCTYPE IS MULTIDATA
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(hostingController.createListing));




router.get("/listing",
    isLoggedIn,
    hasListing,
    wrapAsync(hostingController.renderListings));



router.get("/analytics",
    isLoggedIn,
    hasListing,
    hostingController.renderAnalytics
   )

router.get("/analytics/overview",
    isLoggedIn,
    hasListing,
    hostingController.renderOverview
   )
router.get("/analytics/aiInsights",
    isLoggedIn,
    hasListing,
    hostingController.renderAiInsights
   )

//New Route
router.get("/new",
    isLoggedIn,
    wrapAsync(hostingController.renderNewForm));

    // correctly placed /new above /:id. This is crucial in Express so that a URL like /new isn't accidentally caught


router
.route("/:id")
//Show Route
.get(
    isLoggedIn,
    isOwner,
    wrapAsync(hostingController.showListing))
//Update Route
.put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(hostingController.updateListing))
//Delete Route
.delete(
    isLoggedIn,
    isOwner,
    wrapAsync(hostingController.destroyListing));


//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(hostingController.renderEditForm));



router.post("/cloudinary/delete-img",
        isLoggedIn,
        wrapAsync(hostingController.deletImg));





    
module.exports=router;