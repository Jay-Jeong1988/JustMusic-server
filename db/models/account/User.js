let mongoose = require('mongoose');
let musicSchema = require("../Music.js")["musicSchema"];
let categorySchema = require("../Music.js")["categorySchema"];
let reportSchema = require("../Report.js");

let contactInfoSchema = new mongoose.Schema({
    email: {type: String},
    phoneNumber: {type: String, unique: true},
    createdAt: {type: Date, default: Date.now},
})

let profileSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    birthDay: {type: Date},
    createdAt: {type: Date, default: Date.now},
})

let userSchema = new mongoose.Schema({
    accountId: {type: String},
    password: {type: String},
    nickname: {type: String},
    uploads: [musicSchema],
    watchingHistory: [String],
    likes: {type: Number, default: 0},
    clickedCategories: [categorySchema],
    savedCategories: [categorySchema],
    savedMusic: [musicSchema],
    contactInfo: contactInfoSchema,
    profile: profileSchema,
    createdAt: {type: Date, default: Date.now},
    reports: [reportSchema],
    reportsCount: {type: Number, default: 0},
    dailyUploadsCount: {type: Number}
})

module.exports = mongoose.model('User', userSchema);
