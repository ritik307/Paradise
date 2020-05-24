var mongoose=require("mongoose");
var commentSchema=mongoose.Schema({
	text: String,
	//we can store the whole athor here but it will have username,_id,hash,salt we actully dont need all this we anly require id and suername.
	author:{
		//we could just store the id and then use that id to look up the correct author and then grab the username from there but bcz we are printing username more ofter it would not be very efficient to lookup the corrent author everytime by taking abuther oid and then finding its username so instead we are going to store the data inside comment whcih we can only do with the non relational database like mongo 
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String
	}
});
module.exports=mongoose.model("Comment",commentSchema);