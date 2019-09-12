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

// router.post('/login', function(req, res) {
//   User.findOne({email: req.body.accountId}, function (err, user) {
//     if (err) return console.error(err);
//     if (user.password === req.body.password) {
//       res.status(200).json({
//         result: {
//           msg: "successfully logged in",
//           user: user
//         }
//       })
//     } else {
//       res.status(401).json({
//         result: {
//           msg: "invalid password"
//         }
//       })
//     }
//   })
// })

router.post('/signup', (req, res) => {
  const phoneNumber = req.body.phoneNumber.slice(1).replace(/\s/g, '');
  const email = req.body.email;
  const accountId = req.body.accountId;
  const password = req.body.password;
  const passwordConfirmation = req.body.passwordConfirmation;
  const nickname = req.body.nickname || "user" + "00" + _mixPhoneNumber(phoneNumber);
  const newUser = new User({ 
    nickname: nickname,
    accountId: accountId,
    contactInfo: {phoneNumber: phoneNumber},
    profile: {}
  });

  User.findOne({"contactInfo.phoneNumber": phoneNumber}, (err, user) => {
    if (err) return console.error(err);
    if (user == null) {
      newUser.save().then( newUser => {
        console.log("successfully created user: \n" + newUser);
        res.status(200).json({
          "user": newUser,
          "isNew": true
        });
      }).catch(error => {
        console.log(error.message);
          res.status(500).json({
            error: error.message
          })
      })
    }else{
      console.log("existing user: " + user)
      res.status(200).json({
        "user": user,
        "isNew": false
      });
    }
  })

  function _mixPhoneNumber(number) {
    var a = number.split(""),
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

router.get('/:userId/updateProfile', (req, res) => {
  User.updateOne({_id: req.params.userId}, {
    $set: {
      "profile.pictureUrl": req.query.pictureUrl
    }
  }).then(() => {
    console.log("profile picture is updated: " + req.query.pictureUrl)
    res.status(200).send("sucessfully updated profile image");
  }).catch(error => {
    console.log(error.message);
    res.status(500).json({
      error: error.message
    })
  })
})

router.get('/:userId/updateBanner', (req, res) => {
  User.updateOne({_id: req.params.userId}, {
    $set: {
      "profile.bannerImageUrl": req.query.pictureUrl
    }
  }).then(() => {
    console.log("Banner picture is updated: " + req.query.pictureUrl)
    res.status(200).send("sucessfully updated banner image");
  }).catch(error => {
    console.log(error.message);
    res.status(500).json({
      error: error.message
    })
  })
})

router.get('/:userId/updateNickname', (req, res) => {
  User.findOne({_id: req.params.userId}, (err, user) => {
    user.nickname = req.query.nickname;
    user.save().then( updatedUser => {
      console.log("user nickname updated");
      res.status(200).send(updatedUser);
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })
})

module.exports = router;
