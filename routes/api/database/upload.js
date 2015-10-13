var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs"); 
var csv = require("fast-csv");
var multer = require('multer');
var massive = require("massive");

var done = true;

var fileNames = {};
var countProgress = 0;


router.post('/', multer({
  dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename+Date.now() + fieldname;
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  limits: {
    files: 2
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path);
    fileNames[file.fieldname] = file.path;
    //if(numberOfFiles == 2) done = true;
  }
}), function(req, res) {
  // Here you can check `Object.keys(req.files).length`
  // or for specific fields like `req.files.imageField`
  //console.log(req.body.numberOfFiles);
  var dataToDB = {};
  countProgress = 0;
  console.log(req.body.datasetName);
  dataToDB.datasetName = req.body.datasetName;
  for (i in req.files){
    console.log(req.files[i]);
    readInputFiles(req.files[i].path, i, dataToDB, function(pathToFile, dataToDB){
          fs.unlink(pathToFile);
          countProgress += 1;
          if (countProgress == req.body.numberOfFiles){
              uploadToDatabase(dataToDB, function(){
                res.send(dataToDB.datasetName);
              });
          }
    });
  }
  
});

function readInputFiles(pathToFile, fileType, dataToDB, callback){
  if (fileType == 'fileNewick') {
    readNewickfile(pathToFile, fileType, dataToDB, function(dataToDB){
      callback(pathToFile, dataToDB);
    })
  }
  else {
    readCSVfile(pathToFile, fileType, dataToDB, function(dataToDB){
      callback(pathToFile, dataToDB);
    })
  }
}


function readCSVfile(pathToFile, fileType, dataToDB, callback){
  
  var stream = fs.createReadStream(pathToFile);

  dataToDB[fileType] = [];
  var getHeaders = true;
  var identifier;
  var headers = [];

  csv.fromStream(stream, {headers : true, delimiter:'\t'})
      .on("data", function(data){
        if (getHeaders){
          for (i in data) headers.push(i);
          identifier = headers[0];
          if (fileType == 'fileProfile'){
            dataToDB.key = identifier;
            headers.shift();
          } 
          if(dataToDB.key == undefined && fileType == 'fileMetadata') dataToDB.key = identifier;
          dataToDB[fileType + '_headers'] = headers; //remove first element from array. remove the identifier
          getHeaders = false;
        }
        dataToDB[fileType].push(data);
      })
      .on("end", function(){
        console.log("done");
        callback(dataToDB);
      });

}

function readNewickfile(pathToFile, fileType, dataToDB, callback){
  
  var stream = fs.createReadStream(pathToFile);

  dataToDB[fileType] = [];

  fs.readFile(pathToFile, 'utf8', function (err,data) {
      dataToDB[fileType].push(data);
      console.log('Newick done');
      callback(dataToDB);
  });

}

function uploadToDatabase(data, callback){

  //var datasetModel = require('../../../models/datasets');
  if (data.fileMetadata == undefined) data.fileMetadata = [];
  if (data.fileProfile == undefined) data.fileProfile = [];
  if (data.fileNewick == undefined) data.fileNewick = [];

  var instance = {
    name: data.datasetName,
      key: data.key,
      schemeGenes: data['fileProfile_headers'],
      metadata: data['fileMetadata_headers'],
      profiles: data.fileProfile,
      isolates: data.fileMetadata,
      positions: {},
      links: [],
      newick: data.fileNewick
  };

  //var instance = new datasetModel({
  //  name: data.datasetName,
    //key: data.key,
    //schemeGenes: data['fileProfile_headers'],
    //metadata: data['fileMetadata_headers'],
    //profiles: data.fileProfile,
    //isolates: data.fileMetadata,
    //positions: {},
    //newick: data.fileNewick
  //});

  //instance.save(function(e){
    //console.log('saved');
    //callback();
  //});
  
  massive.connect({
    db: "phyloviz"}, function(err, db){
    db.saveDoc("datasets", instance, function(err,res){ console.log('done'); });
    callback();
  });
}


module.exports = router;