var express = require('express');
var router = express.Router();
var Music = require("../db/models/Music")["Music"];
var Category = require('../db/models/Music')["Category"];

router.get('/categories', (req, res)=>{
    Category.find(function(err, categories) {
        if (err) return console.error(err);
        res.status(200).json(categories);
    })
})

router.get('/categories/edit', (req, res)=>{

    updateCategoryImage(req.query.replaceFrom, req.query.replaceTo).then(result => {
        res.status(200).send(result.join("\n"));
    });

    async function updateCategoryImage(replaceFrom, replaceTo){
        let result = [];
        await Category.find(function(err, categories) {
            if (err) res.status(500).send(err);
            for(let category of categories){
                category["imageUrl"] = category["imageUrl"].replace(`/${replaceFrom}/`, replaceTo);
                category.save().then( newCategory => {
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
    Category.findOne({"title": title}, (err, category) => {
        if (err) return console.error(err);
        if (category == null) {
          newCategory.save().then( newCategory => {
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
        }else{
          res.status(200).json({
            msg: "Existing user sent to client",
            category: category
          })
        }
      })
})

router.get('/all', (req, res) => {
  Music.find(function(err, allMusic) {
    if (err) return console.error(err);
    res.status(200).json(allMusic);
  })
})

router.post('/create', (req, res) => {
  console.log(req.body);

  const title = req.body.title;
  const videoUrl = req.body.videoUrl;
  const description = req.body.description;
  const userNote = req.body.comment;
  const categoryTitles = req.body.categoryTitles;
  const publishedAt = req.body.publishedAt;
  const channelName = req.body.channelName;
  const newCategories = [];
  const newMusic = new Music({
    title: title,
    description: description,
    videoUrl: videoUrl,
    channelName: channelName,
    userNote: userNote,
    publishedAt: publishedAt,
    categories: []
  })
  
  categoryTitles.forEach(categoryTitle => {
    Category.findOne({"title": categoryTitle.toLowerCase() }, (err, category) => {
      if (err) return console.error(err);
      if (category == null) {
        res.status(404).json({
          error: "Invalid category"
        });
      }else{
        newMusic.categories.push(category);
        console.log("category: " + categoryTitle.toLowerCase());
      }
    }).catch(e => {
      console.log(e);
    })
  });
  
  Music.findOne({"videoUrl": videoUrl}, (err, music) => {
    if (err) return console.error(err);
    if (music == null) {
      newMusic.save().then( newMusic => {
        console.log("successfully saved music: \n" + newMusic);
        res.status(200).json({
          msg: "successfully saved a new music: " + newMusic.title,
        })
      }).catch(error => {
        console.log(error.message);
        res.status(500).json({
          error: error.message
        })
      })
    }else {
      res.status(404).json({
        error: "Music already exists"
      })
    }
  })
})


module.exports = router;