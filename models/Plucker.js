var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PluckerSchema = Schema({
  name: String,
  username: String,
  // username: {type:String, index: true}
  // idnexes must be removed through MongoDB, not mongoose
  poll_id: { type: Schema.Types.ObjectId, ref: 'Poll' },
  items: Schema.Types.Mixed
});

module.exports = PluckerSchema;
