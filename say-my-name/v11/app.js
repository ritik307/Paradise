const express               =require("express"),
	  app                   =express(),
	  bodyParser            =require("body-parser"),
	  mongoose              =require("mongoose"),
	  Campground            =require("./models/campground"),
	  Comment               =require("./models/comment"),
	  seedDB                =require("./seeds"),
	  //v10 feature method override
	  methodOverride        = require("method-override"),
	  //---------------------------
	  passport              =require("passport"),
	  LocalStrategy         =require("passport-local"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  //database models
	  User                  =require("./models/user"),
	  //to display flash messages regarding errors and warnings
	  flash                 =require("connect-flash"); 




//Requiring all my routes that i have created in seperate file.
var commentRoutes    = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes      = require("./routes/index");




//seedDB();	//seed the database	

mongoose.connect("mongodb://localhost/yelp_campV6",{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.static(__dirname+"/public")); //__dirname will print the directory name
///__dirname=workspace/YelpCamp/v6
console.log(__dirname);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

//using method-override
app.use(methodOverride("_mthod")); //convention that has to be followed recomended my method override documentataion


//Passport Configuration
app.use(require("express-session")({
	secret:"whats 1000-7",
	resave:false,
	saveUninitialized : false 
}));   


//AUTHNETICATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //here we will give the local strategy that we have imported above inside that we provide User.authenticate is not the one i have wrote its the one that comes with passport-local-mongoose if we didnt have this package i have to write that method 
passport.serializeUser(User.serializeUser()); //munft mai aya hai ye bhi passport-local-mongoose se 
passport.deserializeUser(User.deserializeUser());//ye bhi 

//using FLASH HERE
//we dont have to setup session as seen in teh docs bcz we already have done that abluev as express-session.
app.use(flash());



//------------------------------------------------------------
//------------------------------------------------------------
// Campground.create({
// 	name:"sandy shores",
// 	url:"https://images.unsplash.com/photo-1535846417087-ff0057791ecf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=832&q=80",
// 	description:"A place at shore side to enjoy with your friends"
// },function(err,campground){
// 	if(err){
// 		console.log(err);
// 	}
// 	else{
// 		console.log(campground);
// 	}
// });

// const campgrounds=[
// 		{name:"Hello Ground" ,url:"https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
// 		{name:"gala night" ,url:"https://images.unsplash.com/photo-1531097517181-3de20fd3f05c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"}
// 	];
//------------------------------------------------------------
//------------------------------------------------------------

//THIS MIDDLEWARE WILL BE CALLED ON EVERY REQUEST
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	//passing message to every route possible
	res.locals.error = req.flash("error");
	res.locals.success=req.flash("success");
	next();
});
 
//using all the routes i have required above.

//there is nothing common in index route so we can just leave it as it is or we can just add "/".
app.use("/",indexRoutes);
//it takes campgroundRoutes(the routes i have defined in the file) and it appends /campgrounds in front of them.so it helps us to clean up the code.
app.use("/campgrounds",campgroundRoutes);
//if i only do this i will encounter a problem
//"Cannot read property 'name' of null"
//pointing to ==>  <h1 style="text-align:center">Insert New Comment to <%= campground.name %></h1> saying campground is null
//this means it is not finding campground in the database bcz inside the comment route when we create a new comment the first thing it does is find the campground by the id and our id is not being found , to prove this just console.log(req.params.id); to know in "/new" it will print null before the error 
// whats happening is that our :id route parameter isnt making it through the comments route and there is a really easy fix to this ==> var router=express.Router({mergeParams: true}); in commentRoute.
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(3000,()=>{
	console.log("get set goo!!");
});
