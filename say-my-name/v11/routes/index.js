var express=require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/",(req,res)=>{
	res.render("landing");
	//res.send("HEllo to the home page");
});




//-------------------------------------------------
//AUTHENTICATION
//-------------------------------------------------
// show register form route 
router.get("/register",(req,res)=>{
	res.render("register");
});

//Handling Register
// inside the register we are doing other things before we run passport.authenticate we are actually registering the user and then if that works then we are logging the user in using passport.authenticate
router.post("/register",(req,res)=>{
	//res.send("Signed in");
	var newUser = new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			//console.log(err);
			//req.flash("error",err.message);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","welcome to the Paradise307 "+user.username);
			res.redirect("/campgrounds");
		}) 
	})
});

//LOGIN form route
router.get("/login",(req,res)=>{
	//it will only show messaeg if we are redirected from certain paths like when we try to do smething that require user login
	//if we pass message by this way then we have to pass it to every route and some routes dont have access to message and they will show error sso to solev this we add code in our app.js .
	//res.render("login",{message:req.flash("error")});
	res.render("login");
});
//HANDLING lOGIN
//when a req. comes in to /login passport.authenticate() will run first .
//the middleware will call authenticate method which i have set up "passport.use(new LocalStrategy(User.authenticate()));" so when we call this from passport.authenticate on local strategy it will use the method which i havent wrote it muft mai mila hai bu using passport-local-mongoose package but it will call authenticate which will take username and password(req.body.username ,__.__.psaaword) then authenticate that password to what i have stored in the database for that user and it will take care of all the complex logic that i dont have to takecare about and then if it works will successRedirect and dont then failureRedirect
//router.post ("/login",middleware,callback)
router.post("/login",passport.authenticate("local",{ //<== it is the same passport.authenticate that i have used in the register the difference is that inside the register we are doing other things before we run passport.authenticate we are actually registering the user and then if that works then we are logging the user in using passport.authenticate--VS--here in /login the user is presumed to exist already so all i did is passport.authenticate which will log the user in.
	successRedirect:"/campgrounds",
	failureRedirect:"/login"
}),(req,res)=>{ //<== we can remove this it is kept just so that i know ki middleware use kiya hai maine 
	//res.send("logged in");
	 
});

//LOGOUT
router.get("/logout",(req,res)=>{
	req.logout();
	req.flash("success","Logged you out!!");
	res.redirect("/campgrounds");
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