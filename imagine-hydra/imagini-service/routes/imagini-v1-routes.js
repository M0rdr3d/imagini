/**
 * @name imagini-v1-api
 * @description This module packages the Imagini API.
 */
'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const bodyparser = require("body-parser");

let serverResponse = new ServerResponse();
express.response.sendError = function(err) {
  serverResponse.sendServerError(this, {result: {error: err}});
};
express.response.sendOk = function(result) {
  serverResponse.sendOk(this, {result});
};

let api = express.Router();

api.param("image", (req, res, next, image) => {
  if(!image.match(/\.(png|jpg)$/i)){
      return res.sendError("Invalid Image type/extension !!");
  }

  req.image = image; 
  req.localpath = path.join(__dirname, "../uploads", req.image);

  return next();
});


api.head("/:image", (req, res) => {
  fs.access(req.localpath, fs.constants.R_OK, (err) => {
     if(err){
      res.sendError("Image Not Found !");
     } 
     return res.sendOk();
  });
});

api.post("/:image", bodyparser.raw({
  limit : "10mb",
  type : "image/*"
}), (req, res) => {
  
  let fd = fs.createWriteStream(req.localpath,{
      flags: "w+",
      encoding : "binary"
  });

  fd.end(req.body);

  fd.on("close", () => {
      res.sendOk({size: req.body.length});
  });
});


function download_image(req, res){
  
}



api.get("/:image", (req, res) => {
  fs.access(req.localpath, fs.constants.R_OK, (err) => {
    if(err) return res.sendError("Image Not Found");

    let image = sharp(req.localpath);
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

    res.setHeader("Content-Type", "image/" + path.extname(req.image).substr(1));

    image.pipe(res);
});
});

api.get('/',
(req, res) => {
  res.sendOk({greeting: 'Welcome to Hydra Express!'});
});

module.exports = api;
