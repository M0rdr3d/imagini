
const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const sharp = require("sharp");
const app = express();
const settings = require("./settings");
const rethinkdb = require("rethinkdb");

rethinkdb.connect(settings.db, (err, db) =>{
    if(err) throw err;
    console.log("db: ready");

    
    //Service here !
    rethinkdb.tableList().run(db, (err,tables)=>{
        if(err) throw err;

        if(!tables.includes("images")){
            rethinkdb.tableCreate("images").run(db);
        }
    });

    app.param("image", (req, res, next, image) => {
        if(!image.match(/\.(png|jpg)$/i)){
            return res.status(403).end();
        }

        rethinkdb.table("images").filter({name:image})
                    .limit(1).run(db, (err, images)=>{
                        if(err) return res.status(404).end();

                        images.toArray((err,images) => {
                            if(err) return res.status(500).end();
                            if(!images.length) return res.status(404).end();

                            req.image = images[0];

                            return next();
                        });
                    });

        // db.query("SELECT * FROM images WHERE name = ?", [image],
        // (err, images)=>{
        //     if(err || !images.length){
        //         return res.status(404).end();
        //     }
        //     req.image = images[0]; 
        //     return next();
        // });
    }); 
    

    app.post("/uploads/:name", bodyparser.raw({
        limit : "10mb",
        type : "image/*"
    }), (req, res) => {
        rethinkdb.table("images").insert({
            name: req.params.name,
            size : req.body.length,
            data : req.body
        }).run(db, (err) => {
            if(err){
                return res.send({status : "error ", code : err.code, error : err.message});
            }

            res.send({status : "ok", size : req.body.length});
        });
    });


    app.get("/uploads/:image", (req, res) => {
        
        let image = sharp(req.image.data);
        let width = +req.query.width;
        let height = +req.query.height;
        let blur = +req.query.blur;
        let sharpen = +req.query.sharpen;
        let greyscale = ["y","yes","1","on"].includes(req.query.greyscale);
        let flip = ["y", "yes", "1", "on"].includes(req.query.flip);
        let flop = ["y", "yes", "1", "on"].includes(req.query.flop);           
        
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
    

        rethinkdb.table("images").get(req.image.id)
                 .update({date_used: Date.now()}).run(db);
        
                 // db.query("UPDATE images " + 
        //          "SET date_used = UTC_TIMESTAMP " +
        //          "WHERE id = ?", [req.image.id]);

        res.setHeader("Content-Type", "image/" + path.extname(req.image.name).substr(1));
    
        image.pipe(res);
   
    });

    app.delete("/uploads/:image", (req, res) => {
        rethinkdb.table("images").get(req.image.id).delete()
                    .run(db,(err) => {
                            return res.status(err ? 500 : 200).end();
        });
    });
  
    

    app.listen(33333, ()=>{
        console.log("app:ready");
    });
});