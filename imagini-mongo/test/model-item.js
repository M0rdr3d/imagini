

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var itemSchema = new Schema({
    "itemId" : {type: String,
                index:{unique:true}},
    "itemName" : String,
    "price" : Number,
    "currency" : String,
    "categories" : [String]            
});

//Tal y como define "Model" este mongo del orto
var CatalogItem = mongoose.model("Item", itemSchema);

module.exports = {CatalogItem};



//====================================
