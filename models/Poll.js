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
			console.log("this poll" + thisPoll);
			for (var i = 0; i < thisPoll.items.length; i++) {
				// for each of the poll's items, loop through each of its users, locate that item, and average the scores
				var sum = 0;
				var peeps = 0;
				for (var r = 0; r < thisPoll.users.length; r++) {
					// underscore.js to the rescue
					var q = __.findWhere(thisPoll.users[r].items, {
						url: thisPoll.items[i].url
					});
					if (q) {
						sum += q.score;
						peeps++;
					}
				}	
				var avg = parseInt(sum / peeps, 10);
				thisPoll.items[i].score = avg;
			}
			thisPoll.save(callback);
		}
	});
};
module.exports = PollSchema;