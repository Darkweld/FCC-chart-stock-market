'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({
    stockName: String,
    lastUpdated: Number,
    data: Array,
    color: String
});




module.exports = mongoose.model('Stock', Stock);
