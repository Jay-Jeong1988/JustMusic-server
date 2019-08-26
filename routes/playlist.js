var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Music = require("../db/models/schema")["Music"];
var User = require("../db/models/schema")["User"];
var PlayList = require("../db/models/schema")["PlayList"];

router.get('/removeMusic', (req, res) => {
    PlayList.updateOne({
        _id: req.query.playListId
    }, {
        $pull: {
            songs: req.query.musicId
        }
    }).then(() => {
        console.log("1 song is removed from play list");
        res.status(200).json({
            message: "1 song is removed from play list"
        });
    })
    .catch((error) => {
        console.log(error.message);
        res.status(500).json({
            message: error.message
        });
    })
})

router.get('/addMusic', (req, res) => {
    Music.findById(req.query.musicId, (err, music) => {
        if (err) return console.error(err);
        PlayList.updateOne({
                _id: req.query.playListId
            }, {
                $push: {
                    songs: music
                }
            }).then(() => {
                console.log("1 song is added in play list");
                res.status(200).json({
                    message: "1 song is added in play list"
                });
            })
            .catch((error) => {
                console.log(error.message);
                res.status(500).json({
                    message: error.message
                });
            })
    })
})

router.post('/create', (req, res) => {
    const bgUrl = req.body.bgUrl || "https://ik.imagekit.io/kitkitkitit/tr:q-100,w-1000/default_play_list_bg.jpg";
    const playList = new PlayList({
        title: req.body.title,
        songs: [],
        bgUrl: bgUrl
    })
    if (req.body.musicId) {
        Music.findById(req.body.musicId, (err, music) => {
            playList.songs.push(music);
            User.updateOne({
                _id: req.query.userId
            }, {
                $push: {
                    playLists: playList
                }
            }).then(() => {
                console.log("new play list is created with one song");
                res.status(200).json({
                    message: "new play list is created with one song"
                });
            })
        })
    } else {
        playList.save().then(playList => {
            User.updateOne({
                _id: req.query.userId
            }, {
                $push: {
                    playLists: playList._id
                }
            }).then(() => {
                console.log("new empty play list is created");
            })
            res.status(200).json({
                message: "new empty play list is created",
                playList: playList
            });
        }).catch(error => {
            console.log(error.message);
            res.status(500).json({
                error: error.message
            })
        })
    }
})

router.get('/one', (req, res) => {
    PlayList.findById(req.query.playListId, (err, playList) => {
        if (err) return console.error(err);
        res.status(200).json(playList);
    }).catch((error) => {
        console.log(error.message);
        res.status(500);
    })
})

router.get("/all", (req, res) => {
    PlayList.find(function (err, playLists) {
        if (err) return console.error(err);
        res.status(200).json(playLists);
    })
})

router.get("/remove/:playListId", (req, res) => {
    PlayList.deleteOne({_id: req.params.playListId}, (err, playList) => {
        if (err) return console.error(err);
        console.log("removed a play list:" + playList.title);
        res.status(200).json({
            message: "succesfully removed a play list"
        });
    })
})

router.get('/:userId', (req, res) => {
    User.findById(req.params.userId)
        .populate({path: 'playLists', populate: { path: 'songs' }})
        .select("playLists")
        .exec((err, data) => {
            if (err) return console.error(err);
            if (data) {
                res.status(200).json(data.playLists);
            }
        })
})


module.exports = router;