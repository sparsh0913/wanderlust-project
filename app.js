if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override"); //middleware
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
const ExpressError = require("./utils/expressError.js");
const session = require("express-session"); 
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.MONGODB_ATLAS;

const store = MongoStore.create({  //mongoStore
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600
});

store.on("error",()=>{
    console.log("error occured in session" , err);
})


const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
   cookie: { expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
   },
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //for login and signup
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
     res.locals.currUser = req.user;
    next();
})

/* app.get("/demoUser" , async (req,res)=>{
    let fakeUser = new User({
        email:"abc@gmail.com",
        username:"SigmaStudent"
    })

    let registeredUser = await User.register(fakeUser,"helloWorld"); //registering user with register method
    res.send(registeredUser);
}) */

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine","ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); //t parse data using req.body and req.params
app.use(methodOverride("_method")); //to use delete and put request in form.
app.use(express.static(path.join(__dirname , "/public"))); //to serve static files.

/* const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb"; */

main()
.then(()=>{
    console.log("connected to db");
}).catch((err) =>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500 , message="OOPS! Something went wrong!"} = err;
    /* res.status(statusCode).send(message); */
    res.status(statusCode).render("./listings/error.ejs" , {message});
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Wanderlust project running"
  });
});

app.listen(8080 , ()=>{
    console.log("server is listening to port 8080");
})