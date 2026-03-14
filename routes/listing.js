const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage }) //now multer will save the file directly in storage

//index and post route---
router
.route("/")
.get( wrapAsync(listingController.index))
 .post(isLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync(listingController.post)); 

//NEW ROUTE-----------------------------------------------------
router.get("/new" ,isLoggedIn, listingController.renderNewForm);

//show , update and delete route-----------
router
.route("/:id")
.get(wrapAsync( listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

//NEW ROUTE-----------------------------------------------------
router.get("/new" ,isLoggedIn, listingController.renderNewForm);

//UPDATE
//EDIT ROUTE---------------------------------------
router.get("/:id/edit" ,isLoggedIn,isOwner,validateListing , wrapAsync(listingController.renderEditForm));


module.exports = router;