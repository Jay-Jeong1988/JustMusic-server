let mongoose = require('mongoose');

let contactInfoSchema = new mongoose.Schema({
    email: {type: String},
    phoneNumber: {type: String, minlength: 7},
    createdAt: {type: Date, default: Date.now},
})

let profileSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    birthDay: {type: Date},
    createdAt: {type: Date, default: Date.now},
    pictureUrl: {type: String}
})

let playListSchema = new mongoose.Schema({
    title: {type: String, length: 30},
    songs: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'}]
})

let userSchema = new mongoose.Schema({
    accountId: {type: String},
    password: {type: String},
    nickname: {type: String},
    watchingHistory: [String],
    followers: {type: Number, default: 0},
    likedMusic: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'}],
    playLists: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'PlayList'}],
    contactInfo: {type: contactInfoSchema},
    profile: {type: profileSchema},
    createdAt: {type: Date, default: Date.now},
    reports: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'}],
    reportedByOthers: {type: Number, default: 0},
    dailyUploadsCount: {type: Number},
    blockedVideos: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'}]
})


let categorySchema = new mongoose.Schema({
    title: {type: String, lowercase: true},
    imageUrl: {type: String},
    preference: {type: Number, default: 0},
})

let musicSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    userNote: {type: String},
    length: {type: String},
    videoUrl: {type: String, unique: true},
    thumbnailUrl: {type: String},
    categories: [categorySchema],
    uploader: {type: userSchema, required: true},
    publishedAt: {type: String},
    channelName: {type: String},
    likes: {type: Number, default: 0},
    reports: [String],
    reportsCount: {type: Number, default: 0},
    uploadStatus: {String}
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
