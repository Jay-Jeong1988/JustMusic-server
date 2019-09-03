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
    pictureUrl: {type: String},
    bannerImageUrl: {type: String}
})

let playListSchema = new mongoose.Schema({
    title: {type: String, minlength: 1, maxlength: 40},
    songs: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'}],
    bgUrl: {type: String}
})

let userSchema = new mongoose.Schema({
    accountId: {type: String},
    password: {type: String},
    nickname: {type: String},
    followers: {type: Number, default: 0},
    likedMusic: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'}],
    playLists: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'PlayList',
        }],
    contactInfo: {type: contactInfoSchema},
    profile: {type: profileSchema},
    createdAt: {type: Date, default: Date.now},
    dailyUploadsCount: {type: Number},
    blockedVideos: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'Music', index: true}]
})


let categorySchema = new mongoose.Schema({
    title: {type: String, lowercase: true},
    imageUrl: {type: String},
})

let musicSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    userNote: {type: String},
    videoUrl: {type: String, unique: true},
    thumbnailUrl: {type: String},
    categories: [categorySchema],
    uploader: {type: userSchema, required: true},
    publishedAt: {type: String},
    channelName: {type: String},
    likesCount: {type: Number, default: 0},
    blocksCount: {type: Number, default: 0},
    blockedAt: {type: Date}
}, {timestamps: true});

let reportSchema = new mongoose.Schema({
    reason: {type: String},
    description: {type: String},
    reportType: {type: String},
    createdAt: {type: Date, default: Date.now},
})

userSchema.set('autoIndex', false);
let User = mongoose.model('User', userSchema);
let Category = mongoose.model("Category", categorySchema);
let Music = mongoose.model("Music", musicSchema);
let PlayList = mongoose.model("PlayList", playListSchema);

module.exports = {User: User, Category: Category, Music: Music, PlayList: PlayList};
