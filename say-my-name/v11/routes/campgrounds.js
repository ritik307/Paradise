//we have created this router variable is basically a new instace of express router and then we are adding all the routes to the router no longer adding them to the app itself but to this router and then we are returning or exporting at the end.

var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");

var  methodOverride=require("method-override");

router.use(methodOverride("_method")); //what to look for in the action for put/delete req

//INDEX
router.get("/",(req,res)=>{
	console.log(req.user);
	Campground.find({},function(err,allCampgrounds){
		if(err){
			console.log("OOps Error occured!!");
		}
		else{
			res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user});	
		}
	})
	
});

//NEW
router.get("/new",isLoggedIn,(req,res)=>{
	res.render("campgrounds/new");
});


//SHOW
router.get("/:id",(req,res)=>{
	Campground.findById(req.params.id).populate("comments").exec((err,foundCamp)=>{   //bcs we are getting the comment id so we have to populate the id with the actual comment
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show",{campground:foundCamp});
		}
	}); //	
});
//CREATE
//you have to logged in to create a post 
router.post("/",isLoggedIn,(req,res)=>{
	const name=req.body.name;
	const url=req.body.image;
	const desc=req.body.desc;
	//the new and cleaner way of adding user data.
	const author={
		id: req.user._id,
		username: req.user.username
	}
	const newCamp={name:name,url:url,description:desc,author:author};
	//we can add user by the following ways too.but we have a cleaner way too above
	// newCamp.author.id=req.user._id;
	// newCamp.auther.username=req.user.username;
	console.log("new"+req.user);
	Campground.create(newCamp,function(err,newlyCreated){
		if(err){
			console("Error in post");
		}
		else{
			console.log("new Campground details: "+newlyCreated);
			res.redirect("/campgrounds");	//refirect starts with "/" BUT render does not starts with "/"
		}
	});
});

//EDIT
router.get("/:id/edit",checkOwnership,(req,res)=>{
	Campground.findById(req.params.id,(err,foundCamp)=>{
		if(err){
			res.redirect("/campgrounds");
		}  
		else{
			res.render("campgrounds/edit",{campground:foundCamp});
		}
	});
});

//UPDATE
router.put("/:id",checkOwnership,(req,res)=>{
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,(err,updatedCamp)=>{
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			console.log(updatedCamp.url);
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//DELETE
router.delete("/:id",checkOwnership,(req,res)=>{
	Campground.findByIdAndRemove(req.params.id,(err)=>{
		if(err){  
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});

//MIDDLEWARE FOR CHECKING IS THE USER LOGGED iN(AUTHENTICATION)
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	//we provide key and values to the flash function
	//before we redirect to /login we will run the below code of flash and what it will do is it basically takes "plz. login" and it will add this to flash and it wont be displayed until next thing that we see,here it will not render anyhting it will just render the "/login" flash only shows up in next page not evry time the login page is called but only when login is called after flash.
	// it just saying add "plz..." in flash for the next req. and then we redirect to /login then we have to handle this req in /login
	//more ifno at index.js login
	req.flash("error","Please Login first");
	res.redirect("/login");
}

//MIDDLEWARE FOR CHECKING IF RIGHT USER IS EDITING/DELETEING(AUTHERIZATION)
function checkOwnership(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,(err,foundCamp)=>{
			if(err){
				req.flash("error","Campground not found");
				res.redirect("back");
			}else{
				console.log(foundCamp.author.id);
				console.log(req.user._id);
				if(foundCamp.author.id.equals(req.user._id)){
					next();
				}
				else{
					req.flash("error","You dont have permission to do that");
					res.redirect("back");
				}
			}
		});
	}
	else{
		req.flash("error","You need to logged in to do that");
		res.redirect("back");
	}
}

//EXPORT SOMETHING FROM THIS FILE 
module.exports=router;
