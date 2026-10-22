if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const session= require("express-session");
const MongoStore = require('connect-mongo').default;
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy=require("passport-local");
const GoogleStrategy = require('passport-google-oidc');
const User=require("./models/user.js");
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET;
const port=8080;
const {openLoginModal,isHost}=require("./middlewear.js");

const paymentRouter = require("./routes/payment");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const hostingRouter=require("./routes/hosting.js");
const apiRouter=require("./routes/api.js");


const mongoURL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.MONGODB_URI;
async function main(){
    await mongoose.connect(dbUrl);
}
main()
.then(()=>{
    console.log("database connected successfully");
})
.catch((err)=>{
    console.log(err);
})

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs",ejsMate);


//before deploying cookies were stored in local storage
//store is used to store cookies when the site is deployed
const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    //study what is touch after
    //touch after are passed in seconds not milliseconds
    touchAfter:24*3600
});

store.on("error",(err)=>{
    console.log("Error In Mongo Session Store",err);
});

//defining session options
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.get("/",(req,res)=>{
    res.send("this is home route");
});

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(openLoginModal);

passport.use(new LocalStrategy({
            usernameField: "email"
        },User.authenticate()));
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile','email' ]
}, async function verify(issuer, profile, done) {
    try{
        let user=await User.findOne({googleId:profile.id})
        if(user){
            return done(null, user);
        }
        else{
            let newuser= new User({
                username:profile.displayName,
                googleId:profile.id,
                email: profile.emails?.[0]?.value
            })
            let savedUser=await newuser.save();
            return done(null, savedUser);
        }
    }catch(err){
        return done(err);
    }
      
     
    }));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(isHost);
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.warning=req.flash("warning");
    res.locals.currUser=req.user;
    next();
});
//this is done so that i don,t need to send currentpage with every route 
//automatically ejs will get it null i will modify it for those ejs for which it is needed
app.use((req, res, next) => {
    res.locals.currentPage = null;
    next();
});
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/hosting",hostingRouter)
app.use("/api",apiRouter);
app.use("/",userRouter);
app.use("/payment", paymentRouter);

//making hosting section



app.all("/{*splat}",(req,res)=>{
    throw new ExpressError(404,"page not found");
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(port,()=>{
    console.log(`listening to port:${port}`);
});