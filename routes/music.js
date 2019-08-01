var express = require('express');
var router = express.Router();
var Music = require("../db/models/schema")["Music"];
var Category = require('../db/models/schema')["Category"];
var User = require("../db/models/schema")["User"];

router.get('/categories', (req, res) => {
  Category.find(function (err, categories) {
    if (err) return console.error(err);
    res.status(200).json(categories);
  })
})

router.get('/categories/edit', (req, res) => {

  updateCategoryImage(req.query.replaceFrom, req.query.replaceTo).then(result => {
    res.status(200).send(result.join("\n"));
  });

  async function updateCategoryImage(replaceFrom, replaceTo) {
    let result = [];
    await Category.find(function (err, categories) {
      if (err) res.status(500).send(err);
      for (let category of categories) {
        category["imageUrl"] = category["imageUrl"].replace(replaceFrom, replaceTo);
        category.save().then(newCategory => {
          result.push(newCategory["imageUrl"]);
        }).catch(err => {
          result.push(err.message);
        });
      }
    })
    return result;
  }
})

router.get('/categories/create', (req, res) => {
  console.log(req.query)
  const title = req.query.title;
  const imageUrl = req.query.imageUrl;
  const newCategory = new Category({
    title: title,
    imageUrl: imageUrl
  })
  Category.findOne({
    "title": title
  }, (err, category) => {
    if (err) return console.error(err);
    if (category == null) {
      newCategory.save().then(newCategory => {
        console.log("successfully created category: \n" + newCategory);
        res.status(200).json({
          msg: "successfully created a new category: " + newCategory.title,
          category: newCategory
        })
      }).catch(error => {
        console.log(error.message);
        res.status(500).json({
          error: error.message
        })
      })
    } else {
      res.status(200).json({
        msg: "Existing category",
        category: category
      })
    }
  })
})

router.get('/all', (req, res) => {
  let musicToBeSent = [];
  if (Object.keys(req.query).length === 0) {
    Music.find(function (err, allMusic) {
      if (err) return console.error(err);
      console.log("sending " + allMusic.length + " songs");
      res.status(200).json(allMusic);
    })
  } else {
    var promises = [];
    for (let i = 0; i < Object.keys(req.query).length; i++) {
      promises.push(Music.find({
        "categories.title": req.query[`category${i}`]
      }, (err, musics) => {
        if (err) return console.error(err);
        console.log("songs found with category, " + req.query[`category${i}`] + ": " + musics.length);
        return musics;
      }));
    }
    Promise.all(promises).then((values) => {
      let musics = values.flat();
      let musicIds = [];
      let checkingIndex = 0;
      let independentArray = JSON.parse(JSON.stringify(musics));

      for(let music of musics){
        musicIds.push(music._id.toString());
      }

      for(let i = 0; i < independentArray.length; i++){
        let rest = musicIds.slice(i+1);
	if(rest.includes(musics[checkingIndex]._id.toString())) {
	  musics.splice(musics.indexOf(musics[checkingIndex]),1);
        }else {
	  checkingIndex++;
        }
      }
      console.log("sending: " + musics.length + " songs");
      res.status(200).json(musics);
    });
  }
})

router.post('/create', (req, res) => {
  const title = req.body.title;
  const videoUrl = req.body.videoUrl;
  const description = req.body.description;
  const thumbnailUrl = req.body.thumbnailUrl;
  const userNote = req.body.comment;
  const categoryTitles = req.body.categoryTitles;
  const publishedAt = req.body.publishedAt;
  const channelName = req.body.channelName;
  const userId = req.body.userId;

  Music.findOne({
    "videoUrl": videoUrl
  }, (err, music) => {
    if (err) return console.error(err);
    if (music == null) {
      const newMusic = new Music({
        title: title,
        description: description,
        videoUrl: videoUrl,
        channelName: channelName,
        userNote: userNote,
        publishedAt: publishedAt,
        thumbnailUrl: thumbnailUrl,
        categories: [],
        uploader: {},
        uploadStatus: "pending"
      })

      newMusic.save().then(newMusic => {
        console.log("successfully saved music: \n" + newMusic);

        categoryTitles.forEach(categoryTitle => {
          Category.findOne({
            title: categoryTitle
          }, (err, category) => {
            newMusic.categories.push(category);
            Music.updateOne({
              _id: newMusic._id
            }, {
              $push: {
                categories: category
              }
            }).then(updatedMusic => {
              console.log("pushed category, " + category.title)
            });
          })
        });

        User.findById(userId, (err, user) => {
          if (err) return console.error(err);
          if (user != null) {
            Music.updateOne({
              _id: newMusic._id
            }, {
              $set: {
                uploader: user
              }
            }).then(updatedMusic => {
              console.log("user, " + user.nickname + " is added.");
            });
            user.uploads.push(newMusic._id);
            User.updateOne({
              _id: user._id
            }, {
              $set: {
                uploads: user.uploads
              }
            }).then(newUser => {
              console.log("created music is saved into user's uploads");
            })
          } else {
            console.log("music saved by unknown user");
          }
        })
        res.status(200).json({
          msg: "successfully saved a new music: " + newMusic.title,
        })
      }).catch(error => {
        console.log(error.message);
        res.status(500).json({
          error: error.message
        })
      })
    } else {
      console.log("Music already exists");
      res.status(500).json({
        error: "Music already exists"
      })
    }
  })
})

// User.findById(userId, (err, user) => {
//   if (err) return console.error("error: " + err);
//   if (user != null) {
//     newMusic.uploader = {
//       _id: user._id,
//       nickname: user.nickname,
//       uploads: user.uploads,
//       followers: user.follwers,
//       reports: user.reports,
//       reportedByOthers: user.reportedByOthers,
//       blockedVideos: user.blockedVideos,
//     }
//     console.log("uploader: " + newMusic.uploader);

//     categoryTitles.forEach(categoryTitle => {
//       Category.findOne({"title": categoryTitle.toLowerCase() }, (err, category) => {
//         if (err) return console.error(err);
//         if (category == null) {
//           res.status(404).json({
//             error: "Invalid category"
//           });
//         }else{
//           newMusic.categories.push(category);
//           console.log("category: " + categoryTitle.toLowerCase());
//         }
//       })
//     });
//     return user;
//   }else {
//     res.status(404).json({
//       error: "Invalid user"
//     });
//   }
// }).then((user)=>{
//   Music.findOne({"videoUrl": videoUrl}, (err, music) => {
//     if (err) return console.error(err);
//     if (music == null) {
//       newMusic.save().then( newMusic => {
//         console.log("successfully saved music: \n" + newMusic);

//         user.uploads.push(newMusic._id);
//         User.updateOne({ _id: user._id }, { $set: { uploads: user.uploads } }).then( newUser => {
//           console.log("created music is saved into user's uploads");
//         })
//         res.status(200).json({
//           msg: "successfully saved a new music: " + newMusic.title,
//         })
//       }).catch(error => {
//         console.log(error.message);
//         res.status(500).json({
//           error: error.message
//         })
//       })
//     }else {
//       res.status(404).json({
//         error: "Music already exists"
//       })
//     }
//   })
// })
// })


module.exports = router;
