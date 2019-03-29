

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

mongoose.connect("mongodb://localhost/catalog");
let mongodb = mongoose.connection;
mongodb.on("error", console.error.bind(console, "Mongo connection Error: "));
mongodb.once("open", () => {
    var watch = new CatalogItem({
        itemId: 10,
        itemName: "Sports Watch2",
        brand: "A1",
        price: 100,
        currency: "EUR",
        categories: ["Watches", "Sport Watches"]
    });

    watch.save((error, item, affecteNo)=> {
        if(!error){
            console.log("Item added successfully to the catalog");
        }else {
            console.log("Cannot add item to the catalog...");
        }
    });
});

mongodb.once("open", () => {
    var filter = {
        "itemName" : "Sports Watch2",
        "price" : 100
    }
   
    CatalogItem.find(filter, (error, result) => {
        if(error){
            console.log("Error Ocurred !");
        }else {
            console.log("Results found: " + result.length);
            console.log(result);
        }
    });
});


module.exports = {CatalogItem}
//====================================
