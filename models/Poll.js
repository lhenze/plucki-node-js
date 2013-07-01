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
	this.findById(id).populate('users', 'items').exec(function(err, thisPoll) {
		if (err) {
			console.log("static: " + err);
			//return next(err);
		} else {
			// underscore.js -- using the filter method to create a new array, without refs to broken users
			var newCleanArray = __.filter(thisPoll.users, function(userObj) {
				return ((typeof userObj === 'undefined') || (typeof userObj.items === 'undefined') || (userObj.items.length == 0 ));
			});
			
			thisPoll.users = newCleanArray;
			for (var i = 0; i < thisPoll.items.length; i++) {
				console.log(" --> it is " + thisPoll.items[i].url);
				var sum = 0;
				var avg = 0;
				for (var r = 0; r < thisPoll.users.length; r++) {
					// Be careful - this will only work if the items appear in the same order
					// This should be fixed to reference by items' urls
					sum += parseInt(thisPoll.users[r].items[i].score, 10);
				}
				avg = parseInt(sum / thisPoll.users.length, 10);
				thisPoll.items[i].score = avg;

			}
			thisPoll.save(cb);
		}
	});
};
module.exports = PollSchema;