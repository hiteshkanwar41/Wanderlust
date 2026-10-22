const Listing=require("./models/listing");
const Review=require("./models/review");
const {listingSchema,reviewSchema,bookingSchema}=require("./schemas/Schema.js");
let ExpressError=require("./utils/ExpressError.js")

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        if (req.method === "GET") {
            // implementing it only for GET requests so that we can recover the page
            // for which the request was made.
            // not for POST, PUT, PATCH, or DELETE,
            // because in user.js we use res.redirect() after login,
            // and res.redirect() always sends a GET request to the saved URL.
            //so if you store POST, PUT, PATCH, or DELETE, url than it will send gt request on those url and that get req may not exist
            //which will show page does not exist that is why we store only for GET.
            req.session.redirectUrl = req.originalUrl;
        }else{
            req.session.redirectUrl = req.headers.referer;
        }
        
        req.session.openLoginModal=true;
        req.flash("warning","You must be logged in to perform this action.");
        return res.redirect(req.headers.referer || "/listings");
    }
    next();
}
    
module.exports.isLoggedInAjax = (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.session.redirectUrl = req.headers.referer;
            return res.status(401).json({
                success: false,
                message: "You must be logged in.",
                openLoginModal: true
            });
        }

        next();
    };

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    
    next();
}

module.exports.openLoginModal = (req, res, next) => {

    if(req.body && req.body.closed && req.body.closed==true ){
        delete req.session.redirectUrl;
    }
    res.locals.openLoginModal = req.session.openLoginModal || false;

    delete req.session.openLoginModal;

    next();
};


module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(req.headers.referer || "/listings");
    }
    next();
}
module.exports.isNotOwner=async (req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(listing.owner.equals(req.user._id)){
        req.flash("error","You cannot review your own listing.");
        return res.redirect(req.headers.referer || "/listings");
    }
    next();
}

module.exports.hasListing = async (req, res, next) => {
    //you should know why used exists not findOne 
    const hasListing = await Listing.exists({ owner: req.user._id });
    if (!hasListing) {
        req.flash("error", "Become a host first by creating a listing.");
        return res.redirect("/hosting/new");
    }

    next();
};

module.exports.isHost = async (req, res, next) => {
    if (req.user) {
        const hasListing = await Listing.exists({ owner: req.user._id });
        res.locals.isHost = !!hasListing;
    } else {
        res.locals.isHost = false;
    }

    next();
};

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){

        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isAuthor=async(req,res,next)=>{
     let {reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(req.headers.referer || "/listings");
    }
    next();
}

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateBooking=(req,res,next)=>{
    let {error}=bookingSchema.validate(req.body);
    if(error){
        
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}