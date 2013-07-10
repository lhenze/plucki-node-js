var db = require('../models');
var __ = require('underscore');

//http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript/

function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
  .replace(/\s+/g, '-') // collapse whitespace and replace by -
  .replace(/-+/g, '-'); // collapse dashes

  return str;
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
        console.log("oh dear, there's an error at " + err);

      } else {
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
    //console.log("underscore " + __.uniq([6, 5, 3, 5, 5, 3, 1]));
    var thisID = req.params.id;
    req.session.thisID = thisID;
    var thisName, thisUsersItems;
    var thisPollID, thisPollName, thisPollAllUsers;

    db.Plucker.findById(thisID, function(err, thisPerson) {
      if (err) {
        console.log("Cannot find this User by id: " + err);
        return next(err);
      }
      req.session.thisName = thisName = thisPerson.username;
      thisUsersItems = thisPerson.items;
      thisPollID = req.session.thisPollID = thisPerson.poll_id;
      db.Poll.findById(thisPollID).populate('users', 'username').exec(function(err, thisPoll) {
        if (err) {
          console.log(err);
          return next(err);
        }
        req.session.thisPollName = thisPollName = thisPoll.pollname;
        //thisPollID = thisPoll.id;
        req.session.pollitems = thisPoll.items;
        // when displaying the page, show all items, even if this user doesn't have a value for that one yet. 
        for (var i = 0; i < thisPoll.items.length; i++) {
          // find the object in this user's list that correlates to the larger list
          for (var r = 0; r < thisPerson.items.length; r++) {
            var q = __.findWhere(thisPerson.items, {
              url: thisPoll.items[i].url
            });
            if (!q) {
              //console.log("didn't find " + thisPoll.items[i].url + " in " + thisName + 's items');
              thisPerson.items.push({
                url: thisPoll.items[i].url,
                name: thisPoll.items[i].name,
                score: '12'
              });
            }
          }
          thisPerson.save();
        }
        //  get a list of users' names, excluding this one, for the navigation. 
        var otherUsersNamesArray = [];
        for (var t = 0; t < thisPoll.users.length; t++) {
          if (thisPoll.users[t].username != thisName) {
            otherUsersNamesArray.push(thisPoll.users[t].username);
          }
        }
        req.session.otherUsersNamesArray = otherUsersNamesArray;
        res.render('home', {
          thisID: thisID,
          pluckername: thisName,
          pluckeritems: thisUsersItems,
          pollname: thisPollName,
          pollitems: thisPoll.items,
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
    }, function(err, thisPerson) {
      if (err) {
        console.log("the err is " + err);
      } else {
        ////

        ////
        for (var i = 0; i < req.session.pollitems.length; i++) {
          // find the object in this user's list that correlates to the larger list
          for (var r = 0; r < thisPerson.items.length; r++) {
            var q = __.findWhere(thisPerson.items, {
              url: req.session.pollitems[i].url
            });
            if (!q) {
              //console.log("didn't find " + thisPoll.items[i].url + " in " + thisName + 's items');
              thisPerson.items.push({
                url: req.session.pollitems[i].url,
                score: req.session.pollitems[i].score,
                name: req.session.pollitems[i].name
              });
            }
          }
        }
        thisPerson.save(function(err, giraffe) {
          if (err) {
            console.log("the err is " + err);
          } else {
            console.log("saved! about to render a " + giraffe);
            res.render('otheruser', {
              thisID: req.session.thisID,
              uID: thisPerson.id,
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
        //console.log("Post updated: %s", saved);
        res.send("this was saved!");
      }
    });
  });
  // Add a new item
  app.post('/:id/newitem', function(req, res, next) {
    // this route is  accessed via ajax
    var thisID = req.params.id;
    // when the request was sent as JSON, there is no req.body.data
    // here, req.body comes in as a plain object
    var newItemName = req.body.new;
    var item = new db.Item();

    item.name = newItemName;
    item.score = 0;
    item.url = string_to_slug(newItemName);

    db.Plucker.update({
      _id: thisID
    }, {
      //The $addToSet operator adds a value to an array only if the value is not in the array already
      $addToSet: {
        items: item
      }
    }, function(err, saved) {
      if (err || !saved) {
        console.log("Post not updated: " + err);
      } else {
        console.log("poll " + req.session.thisPollID);
        db.Poll.update({
          _id: req.session.thisPollID
        }, {
          //The $addToSet operator adds a value to an array only if the value is not in the array already
          $addToSet: {
            items: item
          }
        }, function(err, saved) {
          if (err || !saved) {
            console.log("Post not updated: " + err);
          } else {
            res.send("this was saved!");
          }
        });
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
        // this is hard-coded for now.  shall not always be
        user.poll_id = "51ad319e14f73292f600000c";
        db.Poll.findById(user.poll_id, function(err, thisP) {
          user.items = thisP.items;
          for (j = 0; j < user.items.length; j++) {
            user.items[j].score = 12;
          }
          // for(index in object) { var attr = object[index]; }
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
              //console.log("pastrami is saved: " + pastrami);
              res.redirect("/i/" + newUser.id);
            });
          });
        });
      } else {
        res.redirect("/nameistaken");
      }
    });
  });
};