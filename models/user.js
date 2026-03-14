const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email : {
    type: String,
    required:true,
  },

})

userSchema.plugin(passportLocalMongoose); //automatically implement username with salting , password and hash

module.exports = mongoose.model("User", userSchema);