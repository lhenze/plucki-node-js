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

//AvForJustOneItem(0, itemArray);
PollSchema.statics.averageResults = function(id, callback) {
	this.findById(id).populate('users', 'items').exec(function(err, thisPoll) {

		if (err) {
			console.log("static: " + err);
			//return next(err);
		} else {
			console.log("this poll" + thisPoll);
			// underscore.js -- using the filter method to create a new array, without refs to broken users
			//var newCleanArray = __.filter(thisPoll.users, function(userObj) {
			// return true if it the user and its items are all defined
			//return (!((typeof userObj === 'undefined') || (typeof userObj.items === 'undefined') || (userObj.items.length === 0)));
			//});
			//console.log(" 1 -- >> thisPoll.users: " + Array.isArray(thisPoll.users) + thisPoll.users.length);
			//thisPoll.users = newCleanArray;
			//console.log(" 2 -- >> thisPoll.users: " + Array.isArray(thisPoll.users) + thisPoll.users.length);

			//Model.AvForJustOneItem(0, thisPoll.items.length, thisPoll.items[0]);
			for (var i = 0; i < thisPoll.items.length; i++) {
				console.log(thisPoll.items[i].url + " avg so far: " + thisPoll.items[i].score);
				var sum = 0;
				for (var r = 0; r < thisPoll.users.length; r++) {
					// underscore.js to the rescue
					var q = __.findWhere(thisPoll.users[r].items, {
						url: thisPoll.items[i].url
					});

					sum += q.score;
				}
				var avg = parseInt(sum / thisPoll.users.length, 10);
				thisPoll.items[i].score = avg;
			}
			thisPoll.save(callback);
		}
	});
};
module.exports = PollSchema;