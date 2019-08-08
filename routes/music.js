var express = require('express');
var router = express.Router();
var Music = require("../db/models/schema")["Music"];
var Category = require('../db/models/schema')["Category"];
var User = require("../db/models/schema")["User"];
var PlayList = require("../db/models/schema")["PlayList"];

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

router.get('/all/:userId', (req, res) => {
  let musicToBeSent = [];

  function getMusicsPromise(queryKeys){
    if (queryKeys.length === 0) {
      return Music.find(function (err, allMusic) {
        if (err) return console.error(err);
        return allMusic;
      });
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
      return Promise.all(promises).then((values) => {
        let musics = values.flat();
        let musicIds = [];
        let checkingIndex = 0;
        let independentArray = JSON.parse(JSON.stringify(musics));

        for (let music of musics) {
          musicIds.push(music._id.toString());
        }

        for (let i = 0; i < independentArray.length; i++) {
          let rest = musicIds.slice(i + 1);
          if (rest.includes(musics[checkingIndex]._id.toString())) {
            musics.splice(musics.indexOf(musics[checkingIndex]), 1);
          } else {
            checkingIndex++;
          }
        }
        return musics;
      });
    }
  }

  getMusicsPromise(Object.keys(req.query)).then( allMusic => {
    if (req.params.userId === "111111111111111111111111"){
      Music.find(function (err, allMusic) {
        if (err) return console.error(err);
        console.log("sending " + allMusic.length + " songs");
        res.json(allMusic);
      });
    }else {
      User.findById(req.params.userId)
      .select('blockedVideos')
      .exec((err, data) => {
        if(err) return console.error(err);
        if (data) {
          let allMusicIds = [];
          for(let music of allMusic) {
            allMusicIds.push(`${music._id}`);
          }
          console.log("user's total blocked videos: " + data.blockedVideos.length);
          console.log("music count before: " + allMusic.length);
          for(let i = 0; i < data.blockedVideos.length; i++) {
            let matchingIndex = allMusicIds.indexOf(`${data.blockedVideos[i]}`);
            if ( matchingIndex > -1){
              allMusic.splice(matchingIndex, 1);
            }
          }
          console.log("music count after: " + allMusic.length + " (sending music)");
          res.status(200).json(allMusic);
        }else {
          console.error("Invalid user id");
          res.status(404).json({
            message: "Invalid user id"
          })
        }
      })
    }
  })
})

router.get('/myposts/:userId', (req, res) => {
  Music.find({"uploader._id": req.params.userId})
  .sort({
      likesCount: -1
    })
  .exec((err, songs) => {
    if (err) return console.error(err);
    res.status(200).json(songs);
  })
})

router.get('/likes/create', (req, res) => {
  User.updateOne({_id: req.query.userId}, {
    $push: {
      likedMusic: req.query.musicId
    }}).then(() => {
        console.log("pushed the song into likedMusic");
        Music.updateOne({_id: req.query.musicId}, {
          $inc: {
            likesCount: 1
          }
        }).then(() => {
          res.status(200).send("pushed the song into likedMusic");
        })
    }).catch(error => {
      console.log(error.message);
      res.status(500).json({
        error: error.message
      })
    })
})

router.get('/likes/delete', (req, res) => {
  User.updateOne({_id: req.query.userId}, {
    $pull: {
      likedMusic: req.query.musicId
  }}).then(() => {
    console.log("pulled the song from likedMusic");
    Music.updateOne({_id: req.query.musicId}, {
      $inc: {
        likesCount: -1
      }
    }).then(() => {
      res.status(200).send("pulled the song from likedMusic");
    })
  }).catch(error => {
    console.log(error.message);
    res.status(500).json({
      error: error.message
    })
  })
})

router.get('/likes/:userId', (req, res) => {
  User.findById(req.params.userId)
  .populate('likedMusic')
  .select('likedMusic')
  .exec((err, data)=>{
    if (data) {
      res.status(200).json(data.likedMusic);
    }else {
      res.status(404).json({"message": "User does not exist"});
    }
  })
})

router.get('/blocks/create', (req, res) => {
  User.updateOne({_id: req.query.userId}, {
    $push: {
      blockedVideos: req.query.musicId
    }}).then(() => {
        console.log("pushed the song into blockedVideos");
        User.updateOne({_id: req.query.userId}, {
          $pull: {
            likedMusic: req.query.musicId
        }}).then(() => {
          console.log("pulled the song from likedMusic");
          Music.updateOne({_id: req.query.musicId}, {
            $inc: {
              blocksCount: 1
            }
          }).then(() => {
            res.status(200).send("pushed the song into blockedVideos and pulled the song from likedMusic(if any)");
          })
        }).catch(error => {
          console.log(error.message);
          res.status(500).json({
            error: error.message
          })
        })
    }).catch(error => {
      console.log(error.message);
      res.status(500).json({
        error: error.message
      })
    })
})

router.get('/blocks/delete', (req, res) => {
  User.updateOne({_id: req.query.userId}, {
    $pull: {
      blockedVideos: req.query.musicId
    }}).then(() => {
      console.log("pulled the song from blockedVideos");
      Music.updateOne({_id: req.query.musicId}, {
        $inc: {
          blocksCount: -1
        }
      }).then(() => {
        res.status(200).send("pulled the song from blockedVideos");
      })
    }).catch(error => {
      console.log(error.message);
      res.status(500).json({
        error: error.message
      })
    })
})

router.get('/blocks/:userId', (req, res) => {
  User.findById(req.params.userId)
  .populate('blockedVideos')
  .select('blockedVideos')
  .exec((err, data)=>{
    if (err) return console.error(err);
    if (data) {
      res.status(200).json(data.blockedVideos);
    }else {
      res.status(404).json({"message": "User does not exist"});
    }
  })
})

router.get('/isLiked', (req, res) => {
  User.findById(req.query.userId)
  .populate('likedMusic')
  .select('likedMusic')
  .exec((err, data) => {
    if (err) return console.error(err);
    let isLiked = false;
    if (data) {
      for(let music of data.likedMusic){
        if (music._id == req.query.musicId) isLiked = true;
      }
      res.status(200).json({"isLiked": isLiked});
    }else {
      res.status(404).json({"message": "User does not exist"});
    }
  });
})

router.get('/isBlocked', (req, res) => {
  User.findById(req.query.userId)
  .populate('blockedVideos')
  .select('blockedVideos')
  .exec((err, data) => {
    let isBlocked = false;
    if (data) {
      for(let music of data.blockedVideos){
        if (music._id == req.query.musicId) isBlocked = true;
      }
      res.status(200).json({"isBlocked": isBlocked});
    }else {
      res.status(404).json({"message": "User does not exist"});
    }
  })
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

router.get('/playList/:playListId/addMusic', (req, res) => {
  Music.findById(req.query.musicId, (err, music) => {
    if (err) return console.error(err);
    PlayList.updateOne({_id: req.params.playListId}, {
      $push: {
        songs: music
      }
    }).then(()=> {
      console.log("1 song is added in a play list");
      res.status(200).json({message: "1 song is added in play list"});
    })
    .catch((error) => {
      console.log(error.message);
      res.status(500).json({message: error.message});
    })
  })
})

router.post('/playLists/create', (req, res) => {
  const playList = new PlayList({
    title: req.body.title,
    songs: []
  })
  if (req.query.musicId) {
    Music.findById(req.query.musicId, (err, music) => {
      playList.songs.push(music);
      User.updateOne({_id: req.query.userId}, {
        $push: {
          playLists: playList
        }
      }).then(()=> {
        console.log("new play list is created with one song");
        res.status(200).json({message: "new play list is created with one song"});
      })
    })
  }else {
    User.updateOne({_id: req.query.userId}, {
      $push: {
        playLists: playList
      }
    }).then(() => {
      console.log("new empty play list is created");
      res.status(200).json({message: "new empty play list is created"});
    })
  }
})

router.get('/playLists/:index', (req, res) => {
  User.findById(req.query.userId)
  .select('playLists')
  .exec((err, data) => {
    if(err) return console.error(err);
    if(req.params.index){
      res.status(200).json(data.playLists[req.params.index]);
    }else {
      res.status(200).json(data.playLists);
    }
  })
})

router.get('/getAll', (req, res) => {
  Music.find(function (err, allMusic) {
    if (err) return console.error(err);
    res.json(allMusic);
  });
})

module.exports = router;