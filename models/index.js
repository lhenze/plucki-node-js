var mongoose = require('mongoose'),
    PluckerSchema = require('./Plucker'),
    PollSchema = require('./Poll');

// connect

var uri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || conf.mongo_uri;

mongoose.connect(uri);

// initialize User Model

var Plucker = mongoose.model('Plucker', PluckerSchema);
var Poll = mongoose.model('Poll', PollSchema);
module.exports.Plucker = Plucker;
module.exports.Poll = Poll;
module.exports.uri = uri;
