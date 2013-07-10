var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var __ = require('underscore');
var itemSchema = Schema({
	url: String,
	name: String,
	score: {
		type: Number,
		default: null
	}
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

PollSchema.statics.averageResults = function(id, callback) {
	this.findById(id).populate('users', 'items').exec(function(err, thisPoll) {
		if (err) {
			console.log("static: " + err);
			//return next(err);
		} else {
			// underscore.js -- using the filter method to create a new array, without refs to broken users
			var newCleanArray = __.filter(thisPoll.users, function(userObj) {
				// return true if it the user and its items are all defined
				return (!((typeof userObj === 'undefined') || (typeof userObj.items === 'undefined') || (userObj.items.length === 0)));
			});
			console.log(" 1 -- >> thisPoll.users: " + Array.isArray(thisPoll.users) + thisPoll.users.length);
			thisPoll.users = newCleanArray;
			console.log(" 2 -- >> thisPoll.users: " + Array.isArray(thisPoll.users) + thisPoll.users.length);
			for (var i = 0; i < thisPoll.items.length; i++) {
				console.log(thisPoll.items[i].name + " avg so far: " + thisPoll.items[i].score);
				var sum = 300;
				
				for (var r = 0; r < thisPoll.users.length; r++) {
				//	console.log(" 3 -- >> thisPoll.users: " + Array.isArray(thisPoll.users) + thisPoll.users.length);
					//console.log(" -- >> This user: " + parseInt(thisPoll.users[r].items[i].score, 10));
					// warning! Be careful - this will only work if the items appear in the same order
					// This should be fixed to reference by items' urls
					//if ((!isNaN(thisPoll.users[r].items[i].score))) {
					//	sum += parseInt(thisPoll.users[r].items[i].score, 10);
					//}
					//sum += thisPoll.users[r].items[i].score;
				}
				var avg = parseInt(sum / thisPoll.users.length, 10);
				thisPoll.items[i].score = avg;
			}
			thisPoll.save(callback);
		}
	});
};
module.exports = PollSchema;