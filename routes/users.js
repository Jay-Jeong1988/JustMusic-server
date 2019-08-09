var express = require('express');
var router = express.Router();
var User = require("../db/models/schema")["User"];

router.get('/', function(req, res, next) {
  User.find(function (err, users) {
    if (err) return console.error(err);
    res.status(200).json(users);
  })
});

router.get('/edit', (req, res)=>{

  updateUser(req.query.nickname).then(() => {
      res.status(200).send("success");
  });

  async function updateUser(nickname){
      await User.findOne({nickname: nickname}, function(err, user) {
          if (err) res.status(500).send(err);
          user.nickname = "JustMusic";
          user.save().then( updatedUser => {
              console.log(updatedUser + " is updated");
          }).catch(err => {
              result.push(err.message);
          });
      })
  }
})

router.post('/login', function(req, res) {
  User.findOne({email: req.body.accountId}, function (err, user) {
    if (err) return console.error(err);
    if (user.password === req.body.password) {
      res.status(200).json({
        result: {
          msg: "successfully logged in",
          user: user
        }
      })
    } else {
      res.status(401).json({
        result: {
          msg: "invalid password"
        }
      })
    }
  })
})

router.post('/signup', (req, res) => {
  const phoneNumber = req.body.phoneNumber.slice(1).replace(/\s/g, '');
  const email = req.body.email;
  const accountId = req.body.accountId;
  const password = req.body.password;
  const passwordConfirmation = req.body.passwordConfirmation;
  const nickname = req.body.nickname || "user" + "00" + _mixPhoneNumber;
  const newUser = new User({ 
    nickname: nickname,
    contactInfo: {phoneNumber: phoneNumber},
    profile: {}
  });

  User.findOne({"contactInfo.phoneNumber": phoneNumber}, (err, user) => {
    if (err) return console.error(err);
    if (user == null) {
      newUser.save().then( newUser => {
        console.log("successfully created user: \n" + newUser);
        res.status(200).json(newUser);
      }).catch(error => {
        console.log(error.message);
          res.status(500).json({
            error: error.message
          })
      })
    }else{
      res.status(200).json(user);
    }
  })

  function _mixPhoneNumber(number) {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
  }
})

router.get('/authenticate', (req, res) => {
  if(Object.keys(req.query).length >= 1){
    let phoneNumber = Object.keys(req.query).includes("pnum") ? req.query["pnum"] : "123";
    User.findOne({"contactInfo.phoneNumber": phoneNumber}, (err, user) => {
      if(user != null){
        res.status(200).json({
          msg: "User exists in system"
        })
      }else {
        res.status(401).json({
          msg: "User does not exist"
        })
      }
    })
  }else {
    console.log("query is missing");
    res.status(404).json({
      msg: "User information missing"
    })
  }
})







  // if(password === passwordConfirmation) {
    
  //   user.save().then( user => {
  //     console.log('successfully created a new user: \n' + user);
  //     res.status(200).json({
  //       msg: "successfully created a new user: " + user.nick_name,
  //       user: user
  //     })
  //   }).catch(error => {
  //     res.status(500).json({
  //       msg: error.message
  //     })
  //     console.log(error);
  //   })
  // }else {
  //   res.status(422).json({
  //     msg: "passwords do not match"
  //   })
  // }
// });

// router.get('/:email', (req, res) => {
//   User.findOne({email: req.params.email}, (err, user) => {
//     if(err) return console.error(err)
//     if (user !== null) {
//       console.log("email exists already")
//       res.status(500).json({status: "NA", msg: "Email exists already"})
//     }else {
//       console.log("valid username")
//       res.status(200).json({status: "OK"})
//     }
//   })
// })

// router.post('/update', (req, res) => {
//   User.findOne({email: req.body.email}, (err, user) => {
//     if(err) return console.error(err);
//     user.nick_name = req.body.nick_name;
//     user.save().then(instance => {
//       console.log("user has been updated");
//       res.status(200).json({
//           status: "OK",
//           msg: "user has been updated",
//           user: instance
//       });
//     }).catch(error => {
//       console.log("cannot update user")
//       res.status(500).json({
//           status: "NA",
//           msg: error.message
//       })
//     })
//   })
// })

module.exports = router;
