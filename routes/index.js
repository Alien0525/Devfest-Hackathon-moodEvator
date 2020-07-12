var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

// CLOUDINARY- IMAGE FILE

var multer = require("multer");
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dnso6zpwt",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//ROUTE ROUTE
router.get("/", (req, res) => {
  res.render("landing");
});

// =============
//  AUTH ROUTES
// =============

//SHOW REGISTER FORM
router.get("/register", (req, res) => {
  res.render("register", { page: "register" });
});

//SIGN UP LOGIC
router.post("/register", upload.single("image"), (req, res) => {
  cloudinary.uploader.upload(req.file.path, function (result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.image = result.secure_url;
    var newUser = new User({
      username: req.body.username,
      bio: req.body.bio,
      image: req.body.image,
    });
    if (req.body.adminCode === "alientechbook") {
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        return res.render("register", { error: err.message });
      }
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Hello " + user.username + ", smile!");
        res.redirect("/campgrounds");
      });
    });
  });
});

//SHOW LOGIN FORM
router.get("/login", (req, res) => {
  res.render("login", { page: "register" });
});

//LOGIN ROUTE
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Good to see you again!",
  }),
  (req, res) => {}
);

//LOG OUT
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged you out successfully. See you later!");
  res.redirect("/campgrounds");
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    })
  });
});


module.exports = router;
