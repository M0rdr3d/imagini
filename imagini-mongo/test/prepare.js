var mongoose = require("mongoose");
beforeEach((done) =>{
    function clearDatabase(){
        for(var i in mongoose.connection.collections){
            mongoose.connection.collections[i].remove(function(){});
        }

        return done();
    }

    if(mongoose.connection.readyState === 0){
        mongoose.connect("mongodb://localhost/catalog", (err) => {
            if(err){
                throw err;
            }
            return clearDatabase();
        });
    }else{
        return clearDatabase();
    }
});

afterEach(function(done){
    mongoose.disconnect();
    return done();
});

module.exports = {
    beforeEach
}