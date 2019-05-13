let mongoose = require('mongoose');

let contactInfoSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    phoneNumber: {type: Number, unique: true},
    user_id: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
})

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
