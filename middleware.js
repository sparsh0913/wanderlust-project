const Listing = require("./models/listing");
const Review= require("./models/reviews");
const ExpressError = require("./utils/expressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; //for post login page , we are saving original Url to save
        req.flash("error" , "You must be logged in to perform this action");
        return res.redirect("/login");
    } 
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{ //passport will delete the saved info inside session so we need to save it in locals
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

//to check for the right owner 
module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params; 
         let listing =await Listing.findById(id);
         if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","You are not the owner of this listing");
           return res.redirect(`/listings/${id}`);
         }
         next();
}

//SCHEMA VALIDATION ERROR INTO MIDDLEWARE
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
 if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400 , errMsg);
 } else{
    next();
 }
}

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
 if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400 , errMsg);
 } else{
    next();
 }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params; 
         let review =await Review.findById(reviewId);
         if(!review.author._id.equals(res.locals.currUser._id)){
            req.flash("error","You did not create this review!");
           return res.redirect(`/listings/${id}`);
         }
         next();
}
