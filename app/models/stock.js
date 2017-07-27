'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({
    stockName: String,
    lastUpdated: Number,
    data: Array
});




module.exports = mongoose.model('Stock', Stock);