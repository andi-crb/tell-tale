var express = require('express'),
router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
    }))

//build the REST operations at the base for stories
//this will be accessible from http://127.0.0.1:3000/stories if the default route for / is left unchanged
router.route('/')
    //GET all stories
    .get(function(req, res, next) {
        //retrieve all stories from Monogo
        mongoose.model('Story').find({}, function (err, stories) {
          if (err) {
            return console.error(err);
          } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/stories folder. We are also setting "stories" to be an accessible variable in our jade view
                      html: function(){
                        res.render('stories/index', {
                          title: 'All Stories',
                          "stories" : stories
                        });
                      },
                    //JSON response will show all stories in JSON format
                    json: function(){
                      res.json(infophotos);
                    }
                  });
                }     
              });
      })

    //POST a new story
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var title = req.body.title;
        var author = req.body.author;
        var url = req.body.url;
        //call the create function for our database
        mongoose.model('Story').create({
          title : title,
          author : author,
          url : url
        }, function (err, story) {
          if (err) {
            res.send("There was a problem adding the information to the database.");
          } else {
                  //Story has been created
                  console.log('POST creating new story: ' + story);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                      html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("stories");
                        // And forward to success page
                        res.redirect("/stories");
                      },
                    //JSON response will show the newly created story
                    json: function(){
                      res.json(story);
                    }
                  });
                }
              })
});


//Get a RANDOM story
router.route('/random')
    //GET all stories
    .get(function(req, res, next) {
        //retrieve all stories from Monogo
        mongoose.model('Story').find({}, function (err, stories) {
          if (err) {
            return console.error(err);
          } else {
            var total = stories.length
            var randomNum = Math.floor(Math.random() * total)
            var chosen = (stories[randomNum])
            console.log(typeof chosen)
            var id = chosen._id
            console.log(id)
            res.redirect('/stories/' + id)
                    }
        });
      })    


/* GET New Story page. */
router.get('/new', function(req, res) {
  res.render('stories/new', { title: 'Add New Story' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Story').findById(id, function (err, story) {
        //if it isn't found, we are going to repond with 404
        if (err) {
          console.log(id + ' was not found');
          res.status(404)
          var err = new Error('Not Found');
          err.status = 404;
          res.format({
            html: function(){
              next(err);
            },
            json: function(){
             res.json({message : err.status  + ' ' + err});
           }
         });
        //if it is found we continue on
      } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(story);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
          } 
        });
  });

router.route('/:id')
.get(function(req, res) {
  mongoose.model('Story').findById(req.id, function (err, story) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
    } else {
      console.log('GET Retrieving ID: ' + story._id);
      res.format({
        html: function(){
          res.render('stories/show', {
            "story" : story
          });
        },
        json: function(){
          res.json(story);
        }
      });
    }
  });
});

router.route('/:id/edit')
  //GET the individual story by Mongo ID
  .get(function(req, res) {
      //search for the story within Mongo
      mongoose.model('Story').findById(req.id, function (err, story) {
        if (err) {
          console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
              //Return the story
              console.log('GET Retrieving ID: ' + story._id);
              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                   res.render('stories/edit', {
                    title: 'Story' + story._id,
                    "story" : story
                  });
                 },
                   //JSON response will return the JSON output
                   json: function(){
                     res.json(story);
                   }
                 });
            }
          });
    })
  //PUT to update a story by ID
  .put(function(req, res) {
      // Get our REST or form values. These rely on the "title" attributes
      var title = req.body.title;
      var author = req.body.author;
      var url = req.body.url;

      //find the document by ID
      mongoose.model('Story').findById(req.id, function (err, story) {
          //update it
          story.update({
            title : title,
            author : author,
            url : url
          }, function (err, storyID) {
            if (err) {
              res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                      html: function(){
                       res.redirect("/stories/" + story._id);
                     },
                       //JSON responds showing the updated values
                       json: function(){
                         res.json(story);
                       }
                     });
                  }
                })
        });
    })
  //DELETE a Story by ID
  .delete(function (req, res){
      //find story by ID
      mongoose.model('Story').findById(req.id, function (err, story) {
        if (err) {
          return console.error(err);
        } else {
              //remove it from Mongo
              story.remove(function (err, story) {
                if (err) {
                  return console.error(err);
                } else {
                      //Returning success messages saying it was deleted
                      console.log('DELETE removing ID: ' + story._id);
                      res.format({
                          //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                           res.redirect("/stories");
                         },
                           //JSON returns the item with the message that is has been deleted
                           json: function(){
                             res.json({message : 'deleted',
                               item : story
                             });
                           }
                         });
                    }
                  });
            }
          });
});




module.exports = router;