'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Chart = new Schema({
    lastUpdated: Number,
    dateLabelArray: Array,
    stocks: [{ type: Schema.Types.ObjectId, ref: 'Stock' }]
});




module.exports = mongoose.model('Chart', Chart);