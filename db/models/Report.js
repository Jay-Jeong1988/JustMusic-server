let mongoose = require("mongoose");

let reportSchema = new mongoose.Schema({
    reason: {type: String},
    description: {type: String},
    reportType: {type: String},
    createdAt: {type: Date, default: Date.now},
})

module.exports = reportSchema;