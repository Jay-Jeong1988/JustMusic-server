let mongoose = require('mongoose');

let profileSchema = new mongoose.Schema({
    first_name: {type: String},
    last_name: {type: String},
    birthday: {type: Date},
    user_id: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
})

module.exports = mongoose.model('Profile', profileSchema);
