var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs"); 
var csv = require("fast-csv");
var multer = require('multer');

var done = true;

var fileNames = {};
var numberOfFiles = 0;
var countProgress = 0;
var dataToDB = {};


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
    numberOfFiles += 1;
    fileNames[file.fieldname] = file.path;
    if(numberOfFiles == 2) done = true;
  }
}), function(req, res) {
  // Here you can check `Object.keys(req.files).length`
  // or for specific fields like `req.files.imageField`
  if(done == true) {
    console.log(req.body);
    dataToDB.datasetName = req.body.datasetName;
    for (i in fileNames){
      readCSVfile(fileNames[i], i, function(){
        countProgress += 1;
        if (countProgress == numberOfFiles){
          uploadToDatabase(dataToDB);
          for (i in fileNames){
            fs.unlink(fileNames[i]);
          }
          res.send(dataToDB.datasetName);
        } 
      });
    }
  }
});


function readCSVfile(pathToFile, fileType, callback){
  
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
          dataToDB[fileType + '_headers'] = headers; //remove first element from array. remove the identifier
          getHeaders = false;
        }
        dataToDB[fileType].push(data);
      })
      .on("end", function(){
        console.log("done");
        callback();
      });

}

function uploadToDatabase(data){

  var datasetModel = require('../../../models/datasets');
  var instance = new datasetModel({
    name: data.datasetName,
    key: data.key,
    schemeGenes: data['fileProfile_headers'],
    metadata: data['fileMetadata_headers'],
    profiles: data.fileProfile,
    isolates: data.fileMetadata
  });
  instance.save();
}


module.exports = router;