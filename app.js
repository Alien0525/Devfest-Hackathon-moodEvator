require('dotenv').config()
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  flash = require("connect-flash"),
  Campground = require("./models/campground"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  methodOverride = require("method-override");
// seedDB = require("./seeds");

//REQUIRING ROUTES
var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  indexRoutes = require("./routes/index");

// mongoose.connect(
//     "mongodb://localhost/yelpCamp",
//     {
//       useNewUrlParser: true,
//     }
//   );

mongoose.connect(process.env.databaseURL || "mongodb://localhost/moodEvator", {
  useNewUrlParser: true,
});

// mongoose.connect("mongodb://localhost/moodEvator", {
//   useNewUrlParser: true,
// });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
// seedDB();

//PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "alien",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //passport authenticate middleware
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);



app.listen(process.env.PORT || 5000, process.env.IP, function () {
  console.log("Server started");
});

