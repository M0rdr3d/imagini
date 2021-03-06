
//Example of a little microservice with Seneca - Node

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports = function(settings = {path : "uploads"}) {
    //plugin code goes here ...!
}

service.add("role:upload, image:*, data:*", function(msg, next){
    let filename = path.join(__dirname,"uploads", msg.image);
    let data = Buffer.from(msg.data, "base64");

    fs.writeFile(filename, data, (err) => {
        if(err) return next(err);
        return next(null, {size:data.length});
    });
});

service.add("role:check, image:*", function(msg, next){
    let filename = path.join(__dirname, "uploads", msg.image);

    fs.access(filename, fs.constants.R_OK, (err) => {
        return next(null, {exits: !err});
    });
});

service.add("role:download, image:*", function(msg, next){
   let filename = path.join(__dirname, "uploads", msg.image);

   fs.access(filename, fs.constants.R_OK, (err) =>{

    let image = sharp(filename);
    let width = +msg.width;
    let height = +msg.height;
    let blur = +msg.blur;
    let sharpen = +msg.sharpen;
    let greyscale = !!msg.greyscale;
    let flip = !!msg.flip;
    let flop = !!msg.flop;           
    
    if(width > 0 && height > 0){
        image.ignoreAspectRatio();
    }

    //no entiendo la del medio... null, height
    if(width > 0 || height > 0){
        image.resize(width || null, height || null);
    }

    if(flip) image.flip();
    if(flop) image.flop();
    if(blur > 0) image.blur(blur);
    if(sharpen > 0) image.sharpen(sharpen);
    if(greyscale) image.greyscale();

    image.toBuffer().then((data) => {
        return next(null, {data: data.toString("base64")});
    });

   });
});

service.listen(3003); 