const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
  let { search } = req.query;
  let allListings;
  if (search) {
    allListings = await Listing.find({
      $or: [
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } }
      ]
    });
  } else {
    allListings = await Listing.find({});  
  }
  res.render("./listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
   
    res.render("./listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
   
    let {id} = req.params; 
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author"
        },
    })
    .populate("owner"); //becauase we want to show reviews on page.

    if(!listing){
        req.flash("error" , "The listing you are trying to access does not exist!");
        return res.redirect("/listings")
    }
    res.render("./listings/show.ejs",{listing});
}

module.exports.post = async (req,res,next)=>{

  let response= await  geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()
  
    let url = req.file.path;
    let file = req.file.filename;
 let listing = req.body.listing; 
   const newListing =  new Listing(listing); //creating an instance
   newListing.owner = req.user._id; //saving the id of owner to get the username
   newListing.image = {url,file};
   newListing.geometry = response.body.features[0].geometry;
   await newListing.save();
   req.flash("success" , "New Listing Created!");
   res.redirect("/listings");   
}

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params; 
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error" , "The listing you are trying to access does not exist!");
        return res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250,h_300");
    res.render("./listings/edit.ejs" , {listing,originalImageUrl});
}

module.exports.updateListing = async (req,res)=>{
     let {id} = req.params;     
    let listing = await Listing.findByIdAndUpdate(id , {
        $set: {
              title: req.body.listing.title,
              description: req.body.listing.description,
              price: req.body.listing.price,
              location: req.body.listing.location,
              country: req.body.listing.country,
          }
        },
    );
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
         await listing.save();
    }

    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
      let {id} = req.params; 
      let deletedListing = await Listing.findByIdAndDelete(id);
      req.flash("success" , "Listing Deleted!");
      console.log(deletedListing);
      res.redirect("/listings");
}