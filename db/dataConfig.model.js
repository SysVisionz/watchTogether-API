const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/your-database', {useNewUrlParser: true})

const hashTag = 'your-hashtag';

module.exports = {hashTag, mongoose}