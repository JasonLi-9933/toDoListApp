//jshint esversion:6

const mongoose = require("mongoose");
const ItemSchema = require("./ItemSchema").ItemSchema;

const ListScheme = mongoose.Schema({
    name: {type: String, required: true},
    list: {type: [ItemSchema], required: true}
});

module.exports = mongoose.model("List", ListScheme);
