var db = require('../models'),
  conf = require('../conf');
var __ = require('underscore');

// http://blog.webonweboff.com/2010/05/javascript-search-array-of-objects.html

function arrayIndexOf(a, fnc) {
  if (!fnc || typeof(fnc) != 'function') {
    return -1;
  }
  if (!a || !a.length || a.length < 1) return -1;
  for (var i = 0; i < a.length; i++) {
    if (fnc(a[i])) return i;
  }
  return -1;
}

module.exports.create = function(app) {

  app.get('/', function(req, res, next) {
    //req.session.destroy();

    req.session.pollID = "51ad319e14f73292f600000c";
    res.render('index', {
      title: "Complexity rocks. ",
      bodyclass: "landing"
    });
  });

  app.get('/all', function(req, res, next) {
    req.session.pollID = "51ad319e14f73292f600000c";
    db.Poll.averageResults(req.session.pollID, function(err, savedpoll) {
      if (err) {
        console.log(err);
      } else {
        //console.log("this is my callback " + x.items );
        res.render('all', {
          thisID: req.session.thisID,
          pluckername: req.session.thisName,
          pollname: req.session.thisPollName,
          pollitems: savedpoll.items,
          pollotherusers: req.session.otherUsersNamesArray,
          bodyclass: "all"
        });
      }
    });
  });
  app.get('/i/:id', function(req, res, next) {
    //req.session.destroy();
    console.log("underscore " + __.uniq([6, 5, 3, 5, 5, 3, 1]));
    var thisID = req.params.id;
    req.session.thisID = thisID;
    var thisName, thisUsersItems;
    var thisPollID, thisPollName, thisPollAllUsers;

    db.Plucker.findById(thisID, function(err, thisPerson) {
      if (err) {
        console.log("Cannot find this User by id: " + err);
        return next(err);
      }
      thisName = thisPerson.username;
      req.session.thisName = thisName;
      thisUsersItems = thisPerson.items;
      thisPollID = req.session.thisPollID = thisPerson.poll_id;
      db.Poll.findById(thisPollID).populate('users', 'username').exec(function(err, thispoll) {
        if (err) {
          console.log(err);
          return next(err);
        }
        req.session.thisPollName = thisPollName = thispoll.pollname;
        //thisPollID = thispoll.id;
        req.session.pollitems = thispoll.items;
        // when displaying the page, show all items, even if this user doesn't have a value for that one yet. 
        console.log("thisPerson " + thisPerson);

        for (var i = 0; i < thispoll.items.length; i++) {
          // find the object in this user's list that correlates to the larger list
          // investigate process.nextTick(cb);
          var x = arrayIndexOf(thisPerson.items, function(obj) {
            return obj.url == thispoll.items[i].url;
          });
          if (-1 == x) {
            //console.log("didn't find " + thispoll.items[i].url + " in " + thisName + 's items');
            thisPerson.items.push({
              url: thispoll.items[i].url,
              name: thispoll.items[i].name,
              score: '50'
            });
          }
        }

        thisPerson.save();
        //  get a list of users' names, excluding this one, for the navigation. 
        var otherUsersNamesArray = [];
        for (var t = 0; t < thispoll.users.length; t++) {
          //console.log(t + " ##  " + thispoll.users[t].username);
          // mongoose populate 
          otherUsersNamesArray.push(thispoll.users[t].username);
        }

        req.session.otherUsersNamesArray = otherUsersNamesArray;
        res.render('home', {
          thisID: thisID,
          pluckername: thisName,
          pluckeritems: thisUsersItems,
          pollname: thisPollName,
          pollitems: thispoll.items,
          pollotherusers: otherUsersNamesArray,
          bodyclass: 'home'
        });
      });
      //
      //end poll find by id
    });
    //console.log("*****  req.session. " + JSON.stringify(req.session));
  });
  app.get('/u/:uname/delete', function(req, res, next) {
    db.Plucker.findOneAndRemove({
      username: req.params.uname
    }, function(err, whichOne) {
      if (!err) {
        db.Poll.update({
          _id: req.session.pollID
        }, {
          $pull: {
            users: whichOne._id
          }
        }, function(err, pastrami) {
          if (!err) {
            res.redirect("/i/" + req.session.thisID);
          } else {
            console.log("This is not removed from Polls users array: " + pastrami);
          }
        });
      } else {
        console.log("not removed: err");
      }
    });
  });
  app.get('/u/:uname', function(req, res, next) {
    var uname = req.params.uname;
    console.log("hello: " + uname);
    db.Plucker.findOne({
      username: uname
    }, function(err, adventure) {
      if (err) {
        console.log("the err is " + err);
      } else {
        // help!  There must be a better way to do this. 
        var newUnionArray = __.union(adventure.items, req.session.pollitems);
        for (var i = 0; i < req.session.pollitems.length; i++) {
          // find the object in this user's list that correlates to the larger list
          var x = arrayIndexOf(adventure.items, function(obj) {
            return obj.url == req.session.pollitems[i].url;
          });
          if (-1 == x) {
            //console.log("didn't find." + req.session.pollitems[i].url);
            adventure.items.push({
              url: req.session.pollitems[i].url,
              score: req.session.pollitems[i].score,
              name: req.session.pollitems[i].name
            });
            // console.log(adventure.items);
          }
        }
        adventure.save(function(err, giraffe) {
          if (err) {
            console.log("the err is " + err);
          } else {
            console.log("saved! about to render a " + giraffe);
            res.render('otheruser', {
              thisID: req.session.thisID,
              uID: adventure.id,
              uname: uname,
              pluckername: req.session.thisName,
              pollname: req.session.thisPollName,
              pollitems: giraffe.items,
              pollotherusers: req.session.otherUsersNamesArray,
              bodyclass: "uname"
            });
          }
        });
      } // end if 
    });
  });
  // Update the ratings values
  app.post('/:id/updatevalues', function(req, res, next) {
    // this route is  accessed via ajax
    var thisID = req.params.id;
    // when the request was sent as JSON, there is no req.body.data
    // here, req.body comes in as a plain object
    var y = req.body;
    db.Plucker.findByIdAndUpdate(thisID, y, function(err, saved) {
      if (err || !saved) {
        console.log("Post not updated: " + err);
      } else {
        console.log("Post updated: %s", saved);
        res.send("this was saved!");
      }
    });
  });
  ///
  ///
  ///
  app.post('/addNew', function(req, res, next) {
    var postedname = req.body.name;
    //console.log("this postedname is " + postedname);
    db.Plucker.findOne({
      username: postedname
    }, function(err, user) {
      if (err) {
        console.log("L'Error is " + err);
        return next(err);
      }
      if (!user) {
        user = new db.Plucker();
        user.username = postedname;
        user.items = [];
        // this is hard-coded for now.  shall not always be
        user.poll_id = "51ad319e14f73292f600000c";
        user.save(function(err, newUser) {
          if (err) {
            console.log(err);
            return next(err);
          }
          // add to the "users" array in the poll
          db.Poll.update({
            _id: user.poll_id
          }, {
            $addToSet: {
              users: user
            }
          }, function(err, pastrami) {
            console.log("pastrami is saved: " + pastrami);
            res.redirect("/i/" + newUser.id);
          });

        });
      } else {
        res.redirect("/nameistaken");
      }
    });
  });
};