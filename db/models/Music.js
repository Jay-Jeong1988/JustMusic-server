let mongoose = require("mongoose");
let reportSchema = require("./Report.js");

let categorySchema = new mongoose.Schema({
    title: {type: String},
    imageUrl: {type: String},
    preference: {type: Number, default: 0},
})

let musicSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    userNote: {type: String},
    length: {type: String},
    videoUrl: {type: String, unique: true},
    categories: [categorySchema],
    publishedAt: {type: String},
    channelName: {type: String},
    favorited: {type: Number, default: 0},
    reports: [reportSchema],
    reportsCount: {type: Number, default: 0}
})

let Category = mongoose.model("Category", categorySchema);
let Music = mongoose.model("Music", musicSchema);

module.exports = {musicSchema: musicSchema, categorySchema: categorySchema, Category: Category, Music: Music};