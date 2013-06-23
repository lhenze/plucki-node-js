var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PluckerSchema = Schema({
  name: String,
  username: String,
  poll_id: { type: Schema.Types.ObjectId, ref: 'Poll' },
  items: Schema.Types.Mixed
});

module.exports = PluckerSchema;
