var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        req.flash("error", "ERROR 404 : Post not found")
        res.redirect("back");
      } else {
        //does user own the campground
        if (foundCampground.author.id.equals(req.user._id) || (req.user && req.user.isAdmin)) {
          next();
        } else {
          req.flash("error", "You're not authorized to perform this action!")
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        req.flash("error", "ERROR 404 : Post not found")
        res.redirect("back");
      } else {
        //does user own the campground
        if (foundComment.author.id.equals(req.user._id)||  (req.user && req.user.isAdmin)) {
          next();
        } else {
          req.flash("error", "You're not authorized to perform this action!")
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()||  (req.user && req.user.isAdmin)) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!")
  res.redirect("/login");
};

module.exports = middlewareObj;
