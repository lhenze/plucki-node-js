var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var __ = require('underscore');
var itemSchema = Schema({
	url: String,
	name: String,
	score: Number
});

var PollSchema = Schema({
	pollname: String,
	items: [itemSchema],
	users: [{
			type: Schema.Types.ObjectId,
			ref: 'Plucker'
		}
	]
});

PollSchema.statics.averageResults = function(id, cb) {
	// this.find({ name: new RegExp(name, 'i') }, cb);
	this.findById(id).populate('users', 'items').exec(function(err, thisPoll) {
		if (err) {
			console.log("static: " + err);
			//return next(err);
		} else {
			// underscore.js -- using the filter method to create a new array, without refs to broken users
			var newCleanArray = __.filter(thisPoll.users, function(userObj) {
				return ((typeof userObj === 'undefined') || (typeof userObj.items === 'undefined') || (userObj.items.length == 0 ));
			});
			//console.log("newCleanArray is " + newCleanArray.length);
			thisPoll.users = newCleanArray;
			//console.log("thisPoll.users " + thisPoll.users);
			for (var i = 0; i < thisPoll.items.length; i++) {
				console.log(" --> it is " + thisPoll.items[i].url);
				var sum = 0;
				var avg = 0;
				for (var r = 0; r < thisPoll.users.length; r++) {
					//console.log("** testing " + thisPoll.users[r].items);
					//console.log("it is " + thisPoll.users[r].username + " " + thisPoll.users[r].items + " " + thisPoll.users[r].items[i].score);
					// Be careful - this will only work if the items appear in the same order
					sum += parseInt(thisPoll.users[r].items[i].score, 10);
				}
				avg = parseInt(sum / thisPoll.users.length, 10);
				//console.log("avg! " + avg);
				thisPoll.items[i].score = avg;

			}
			thisPoll.save(cb);
		}
	});
};
module.exports = PollSchema;