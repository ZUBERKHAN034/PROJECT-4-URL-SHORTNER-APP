const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({


    longUrl: {
        type: String,
        required: [true, "Long URL is required"],
        trim: true
    }, // should be a valid url

    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    urlCode: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    }
    
}, { timestamps: true })

module.exports = mongoose.model('Urls', urlSchema)