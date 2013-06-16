 var express = require('express'),
 	routes = require('./routes'),
 	http = require('http'),
 	path = require('path'),
 	dbUrl = require('./conf').mongo_uri;

 var MongoStore = require('connect-mongo')(express);
 var app = express();
 app.set('port', process.env.PORT || 3000);

 app.set('views', __dirname + '/views');
 app.set('view engine', 'jade');
 app.use(express.favicon());
 app.use(express.logger('dev'));
 app.use(express.bodyParser());
 app.use(express.methodOverride());
 app.use(express.cookieParser('your secret here'));
 app.use(express.session({
 	secret: 'node rocks',
 	store: new MongoStore({
 		db: 'Esmerelda',
 		url: dbUrl
 	})
 }));
 app.use(app.router);
 app.use(express.static(path.join(__dirname, 'public')));
 routes.create(app);

 http.createServer(app).listen(app.get('port'), function() {
 	console.log('Express server listening on port ' + app.get('port'));
 });