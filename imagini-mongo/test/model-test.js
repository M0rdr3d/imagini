var mongoose = require("mongoose");
var should = require("should");
var prepare = require("./prepare.js");

const model = require("./model-item.js");
const CatalogItem = model.CatalogItem;


mongoose.createConnection("mongodb://localhost/catalog");

describe("CatalogItem: models", () => {
    describe("#create()", () => {
        it("Should create a new CatalogItem", (done) => {

           var item = {
                "itemId" : "4",
                "itemName" : "Sports Watch",
                "price" : 100,
                "currency" : "EUR",
                "categories" : [
                    "Watches",
                    "Sport Watches"
                ]
           };

           CatalogItem.create(item, (err, createdItem) =>{
               should.not.exist(err);
                //ASsert !!
               createdItem.itemId.should.equal("4");
               createdItem.itemName.should.equal("Sports Watch");
               createdItem.price.should.equal(100);
               createdItem.currency.should.equal("EUR");
               createdItem.categories[0].should.equal("Watches");
               createdItem.categories[1].should.equal("Sport Watches");
                //Notify powerfull Mocha that the testings has ended !!
                //prepare.afterEach(done);
              
                done();
            });

            CatalogItem.deleteOne(item, (err) => {
                if(err){
                    console.log("Perror deleting...");
                }else{
                    console.log("Success deleting");
                }
            })
        });
    });
});

