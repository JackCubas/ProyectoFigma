const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
    prodId : {type: Number, required: true},
    price : {type: Number, required: true},
    quantity : {type: Number, required: true}
}, {timestamps: true});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;