var express = require('express'),
router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); 
    var passport = require('passport');
    var User = require('../model/users');

//used to manipulate POST

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

    //build the REST operations at the base for reviews
//this will be accessible from http://127.0.0.1:3000/reviews if the default route for / is left unchanged
router.route('/')
    //GET all reviews
    .get(function(req, res, next) {
        //retrieve all reviews from Monogo
        mongoose.model('Review').find({}, function (err, reviews) {
          if (err) {
            return console.error(err);
          } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/reviews folder. We are also setting "reviews" to be an accessible variable in our jade view
                      html: function(){
                        res.render('reviews/index', {
                          title: 'All reviews',
                          "reviews" : reviews,
                          user: req.user
                        });
                      },
                    //JSON response will show all reviews in JSON format
                    json: function(){
                      res.json(infophotos);
                    }
                  });
                }     
              });
      })




.post(function(req, res) {
  console.log(req.user)
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var reviewstory = req.body.reviewstory;
        var status = req.body.status;
        var review = req.body.review;
        var rating = req.body.rating;
        var dateread = req.body.dateread
        //call the create function for our database
        mongoose.model('Review').create({
          reviewstory : reviewstory,
          status : status,
          review : review,
          rating : rating,
          reviewuser: req.user._id,
          dateread : dateread,
          dateAdded : new Date
        }, function (err, review) {
          if (err) {
            res.send("There was a problem adding the information to the database.");
          } else {
                  //Review has been created
                  console.log('POST creating new review: ' + review);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                      html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("reviews");
                        // And forward to success page
                        res.redirect("/reviews");
                      },
                    //JSON response will show the newly created review
                    json: function(){
                      res.json(review);
                    }
                  });
                }
              })
});

module.exports = router;