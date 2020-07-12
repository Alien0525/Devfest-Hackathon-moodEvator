var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// CLOUDINARY- IMAGE FILE

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dnso6zpwt', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = router;

//INDEX Route -- Show all Campgrounds

router.get("/", function (req, res) {

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all campgrounds from DB
    Campground.find({ name: regex }, function (err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {
          campgrounds: allCampgrounds,
          page: "campgrounds",
        });
      }
    });
  } else {
    // Get all campgrounds from DB
    Campground.find({}, function (err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {
          campgrounds: allCampgrounds,
          page: "campgrounds",
        });
      }
    });
  }
});

//CREATE -- Add new campground to database
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    
      req.body.campground.image = result.secure_url;
  
    
    // add image's public_id to campground object
    req.body.campground.imageId = result.public_id;
    // add author to campground
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username,
      bio: req.user.bio,
      image: req.user.image
    }
    Campground.create(req.body.campground, function(err, campground) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/campgrounds/' + campground.id);
    });
  });
});


//NEW -- Show form to create a new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
});

// Courses - Show all Courses
router.get("/courses", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/courses.ejs");
});
// Movies
router.get("/movies", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/movies.ejs");
});
// Music
router.get("/music", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/music.ejs");
});
// Books
router.get("/books", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/books.ejs");
});
// Books
router.get("/todo", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/todo.ejs");
});

//Show more info about one campground
router.get("/:id", (req, res) => {
  // find the campground with provided id
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundCampground) {
      if (err) console.log(err);
      else {
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  //is user is logged in
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", upload.single('image'), function(req, res){
  Campground.findById(req.params.id, async function(err, campground){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          if (req.file) {
            try {
                await cloudinary.uploader.destroy(campground.imageId);
                var result = await cloudinary.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
            } catch(err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
          }
          campground.name = req.body.name;
          campground.description = req.body.description;
          campground.save();
          req.flash("success","Successfully Updated!");
          res.redirect("/campgrounds/" + campground._id);
      }
  });
})

//DESTROY CAMPGROUND ROUTE
router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Post deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

