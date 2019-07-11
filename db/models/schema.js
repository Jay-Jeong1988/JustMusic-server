let mongoose = require('mongoose');

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
    uploads: [String],
    watchingHistory: [String],
    likes: {type: Number, default: 0},
    savedCategories: [String],
    savedMusic: [String],
    contactInfo: contactInfoSchema,
    profile: profileSchema,
    createdAt: {type: Date, default: Date.now},
    reports: [String],
    reportsCount: {type: Number, default: 0},
    dailyUploadsCount: {type: Number}
})


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
    uploader: {type: userSchema, required: true},
    publishedAt: {type: String},
    channelName: {type: String},
    favorited: {type: Number, default: 0},
    reports: [String],
    reportsCount: {type: Number, default: 0}
})

let reportSchema = new mongoose.Schema({
    reason: {type: String},
    description: {type: String},
    reportType: {type: String},
    createdAt: {type: Date, default: Date.now},
})

let User = mongoose.model('User', userSchema);
let Category = mongoose.model("Category", categorySchema);
let Music = mongoose.model("Music", musicSchema);

module.exports = {User: User, Category: Category, Music: Music};