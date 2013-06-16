var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PollSchema = Schema({
	pollname: String,
	items: Schema.Types.Mixed,
	users: [{
			type: Schema.Types.ObjectId,
			ref: 'Plucker'
		}
	]
});
PollSchema.statics.averageResults = function(id, cb) {
	// this.find({ name: new RegExp(name, 'i') }, cb);
	this.findById(id).populate('users', 'items').exec(function(err, tp) {
		if (err) {
			console.log("static: " + err);
			//return next(err);
		} else {
			//console.log("static: users: " + tp.users);
			for (var z = 0; z <= tp.users.length; z++) {
				if (typeof tp.users[z] != 'undefined') {
					//console.log("it is " + thispoll.users[z].username);
				} else {
					//clean up any rotten links
					tp.users.splice(z, 1);
				}
			}
			//console.log("tp.users " + tp.users);
			for (var i = 0; i < tp.items.length; i++) {
				console.log(" --> it is " + tp.items[i].url);
				var sum = 0;
				var avg = 0;
				for (var r = 0; r < tp.users.length; r++) {
					//console.log("it is " + tp.users[r].username + " " + tp.users[r].items[i].url + " " + tp.users[r].items[i].score);
					sum += parseInt(tp.users[r].items[i].score, 10);
				}
				avg = parseInt(sum / tp.users.length, 10);
				console.log("avg! " + avg);
				tp.items[i].score = avg;

			}
			tp.save(cb);
		}
	});
};
module.exports = PollSchema;