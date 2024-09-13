const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
    },
    media_url : {
        type: String,
    },
    uid: {
        type: Number,
        required: true,
        unique: true,
    }
});

module.exports = mongoose.model('User', userSchema);