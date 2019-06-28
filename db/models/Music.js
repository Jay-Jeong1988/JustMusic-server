let mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
    title: {type: String},
    imageUrl: {type: String},
    preference: {type: Number, default: 0},
})

let musicSchema = new mongoose.Schema({
    title: {type: String},
    length: {type: String},
    fileUrl: {type: String},
    category: [categorySchema],
    artist: {type: String},
    favorited: {type: Number}
})

let Category = mongoose.model("Category", categorySchema);
let Music = mongoose.model("Music", musicSchema);

module.exports = {musicSchema: musicSchema, categorySchema: categorySchema, Category: Category, Music: Music};