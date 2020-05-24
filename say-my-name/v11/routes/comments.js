var express=require("express");
//var router=express.Router();  <== CAUSING ERROR
//this will merge params from the campground and the comments together so that inside a comment routes we are able to access ":id" i have defined  
var router=express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
 
//===============================
// comment routes
//===============================
//Nested NEW comments new 
router.get("/new",isLoggedIn,(req,res)=>{
	Campground.findById(req.params.id,(err,campground)=>{
		if(err){
			console.log("error");
		}
		else{
			res.render("comments/new",{campground:campground});	
		}
	})
	
});

//Nested CREATE comments create
router.post("/",isLoggedIn,(req,res)=>{
	Campground.findById(req.params.id,(err,campground)=>{
		if(err){
			console.log(err);
		}
		else{
			Comment.create(req.body.comment,(err,comment)=>{
				if(err){
					console.log(err);
				}
				else{	
					//add username and id to the comments
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					console.log(comment.author.username);
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					//console.log(comment);
					req.flash("success","Successfully added comment");
					res.redirect("/campgrounds/"+campground._id);	
				}
			});
		}
	});
});

//MIDDLEWARE FOR CHECKING IS THE USER LOGGED iN
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","Please Login first");
	res.redirect("/login");
}

module.exports=router;