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

    updateCategory().then(result => {
        res.status(200).send(result.join("\n"));
    });

    async function updateCategory(){
        let result = [];
        await Category.find(function(err, categories) {
            if (err) res.status(500).send(err);
            for(let category of categories){
                category["imageUrl"] = category["imageUrl"].replace(/60/, 140);
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


module.exports = router;