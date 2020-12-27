//jshint esversion:6

const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema({
    name: {type: String, required: true},
    listName: {type: String, required: false}
});

module.exports.ItemModel = mongoose.model("Item", ItemSchema);

module.exports.ItemSchema = ItemSchema;
