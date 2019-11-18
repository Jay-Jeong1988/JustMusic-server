var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';

router.get("/check", (req, res) => {
    mongoClient.connect(url, function(err, db) {
        if (err) return console.error(err);
        var dbo = db.db("notpro");
        dbo.collection("updates")
        .find({}).toArray(function(err, data) {
            console.log(data);
            res.status(200).json(data[0]);
            db.close();
        });
    })
})


module.exports = router;