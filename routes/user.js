const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const User=require("../models/user.js");
const passport=require("passport");
let {isLoggedIn,saveRedirectUrl}=require("../middlewear.js");


router.get("/signup",(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.openLoginModal=true;
        req.session.redirectUrl = req.headers.referer;
        return res.redirect(req.headers.referer || "/listings");
    }
    req.flash("warning","Already LoggedIn")
    return res.redirect(req.headers.referer || "/listings");
    
})

router.post("/signup",
    saveRedirectUrl,
    wrapAsync(async(req,res,next)=>{
    try{
          let{username,password,email} = req.body;
    let newuser = new User({username,email});
    let reguser=await User.register(newuser,password);
    req.login(reguser,(err)=>{
        if(err){
            next(err);
        }
         req.flash("success",`Welcome to Wanderlust, ${reguser.username}!`);
         let redirectUrl=res.locals.redirectUrl || "/listings";
         res.redirect(redirectUrl);
    })
   
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
  
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",
    saveRedirectUrl,
    passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true}),
    wrapAsync(async(req,res)=>{
        req.flash("success", `Welcome back, ${req.user.username}!`);
        let redirectUrl=res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
}));

router.get("/logout",
    isLoggedIn,
    (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success", "You've been logged out successfully. See you soon!");
        res.redirect("/listings");
    })
});

router.get("/email-availability",async(req,res)=>{
    let {email}=req.query;
    let user = await User.findOne({email});
    if(!user){
        return res.json({available:true});
    }
    return res.json({available:false});
});

router.get('/login/federated/google', passport.authenticate('google',{failureFlash:true}));

router.get('/oauth2/redirect/google',
    saveRedirectUrl,
    passport.authenticate('google',
    {
    failureFlash:true,
    failureRedirect: "/signup",
    }
),(req,res)=>{
        req.flash("success", `Welcome , ${req.user.username}!`);
        let redirectUrl=res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
});

module.exports=router;