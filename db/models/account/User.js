let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    accountId: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    nickname: {type: String, required: true},
    profile_id: {type: String},
    contactInfo_id: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
})

module.exports = mongoose.model('User', userSchema);
