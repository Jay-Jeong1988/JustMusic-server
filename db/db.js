let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/notpro', function (err, res) {
  if (err) {
  console.log ('ERROR connecting to mongodb: ' + err);
  } else {
  console.log ('Successfully connected to mongodb');
  }
});

module.exports = mongoose.connection;