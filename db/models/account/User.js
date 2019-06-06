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
    contactInfo: contactInfoSchema,
    profile: profileSchema,
    createdAt: {type: Date, default: Date.now},
})

module.exports = mongoose.model('User', userSchema);
