var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    validator = require('express-validator'),
    config = require("./_config"),
    User = require("./db/models/User"),
    mongoose = require('mongoose'),
    environment = app.settings.env || 'development',
    connectionString = config.mongoURI[environment];

mongoose.connect(connectionString, function(err, res){
  if (err){
    console.log("Error: " + err);
  } else {
    console.log("Connected to database: " + connectionString);
  }
})

String.prototype.capitalizedFirstLetter = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validator());
app.use(express.static(__dirname + "/app"));

var port = process.env.PORT || 8000;

var router = express.Router();

router.use(function(req, res, next){
  console.log("Loading....");
  next();
});

router.get('/', function(req, res){
  res.json({ message: "Hello"});
});

router.route('/users')
  .post(function(req, res){
    req.checkBody({
      'firstName': {
        notEmpty: {
          errorMessage: "Invalid firstName..."
        }
      },
      'lastName': {
        notEmpty: {
          errorMessage: "Invalid lastName..."
        }
      },
      'email': {
        notEmpty: {
          errorMessage: "No email entered..."
        },
        isEmail: {
          errorMessage: 'Invalid email...'
        }
      },
      'phone': {
        isLength: { 
          options: [{ min: 10, max: 10 }],
          errorMessage: "phone must be 10 characters..."
        },
        isInt: {
          errorMessage: "Invalid characters in phone..."
        }
      }
    });
    
    var errors = req.validationErrors();
    if (errors){
      res.send(errors);
      // for (i = 0; i < errors.length; i++){
        // console.log("Error: " + errors[i].msg)
      // }
      return;
    } else {
      var user = new User();
      user.firstName = req.body.firstName.toLowerCase();
      user.lastName = req.body.lastName.toLowerCase();
      user.email = req.body.email;
      user.phone = req.body.phone;
      user.phone_sort_id = req.body.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1');
      user.save(function(err){
      if (err) {
        res.send(err);
      }
      res.json({ message: "User created...", 'success': user });
      });
    }
  })
  
  .get(function(req, res){
    User.find(function(err, users){
      if (err){
        res.send(err);
      }
      res.json(users);
    });
  });
  
router.route('/users/:user_id')
  .get(function(req, res){
    User.findById(req.params.user_id, function(err, user){
      if (err){
        res.send(err);
      }
      res.json(user);
    });
  })
  
  .put(function(req, res){
    User.findById(req.params.user_id, function(err, user){
      req.checkBody({
        'firstName': {
          notEmpty: {
            errorMessage: "Invalid firstName..."
          }
        },
        'lastName': {
          notEmpty: {
            errorMessage: "Invalid lastName..."
          }
        },
        'email': {
          notEmpty: {
            errorMessage: "No email entered..."
          },
          isEmail: {
            errorMessage: 'Invalid email...'
          }
        },
        'phone': {
          isLength: { 
            options: [{ min: 10, max: 10 }],
            errorMessage: "phone must be 10 characters..."
          },
          isInt: {
            errorMessage: "Invalid characters in phone..."
          }
        }
      });
      var errors = req.validationErrors();
      if (errors){
        res.send(errors);
        // for (i = 0; i < errors.length; i++){
        //   console.log("Error " + errors[i].msg)
        // }
        return;
      } else {
        if (err){
          res.send(err);
        }
        user.firstName = req.body.firstName.toLowerCase();
        user.lastName = req.body.lastName.toLowerCase();
        user.email = req.body.email;
        user.phone =req.body.phone;
        user.phone_sort_id = req.body.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1');
        user.save(function(err){
          if (err){
            res.send(err);
            console.log(err)
          }
          res.json({ message: "User updated...", 'updated': user });
        });
      }
    });
  })
  
  .delete(function(req, res){
    User.remove({
      _id: req.params.user_id
    }, function(err, user){
      if (err)
       res.send(err)
      res.json({ message: 'Successfully deleted user...', 'removed': user });
    });
  });

app.use('/api', router);

var server = app.listen(port, function(){
  console.log(`Listening on port ${port}...`);
});

module.exports = server;