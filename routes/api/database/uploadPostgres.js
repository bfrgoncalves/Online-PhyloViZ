var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs"); 
var csv = require("fast-csv");
var multer = require('multer');

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
            //headers.shift();
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

  var pg = require("pg");
  var connectionString = "postgres://localhost/phyloviz";

  if (data.fileMetadata == undefined) data.fileMetadata = [];
  if (data.fileProfile == undefined) data.fileProfile = [];
  if (data.fileNewick == undefined) data.fileNewick = [];
  if (data['fileMetadata_headers'] == undefined) data['fileMetadata_headers'] = [];


  function uploadDataset(data, callback){
    userID = 'bgoncalves';
    profiles = { profiles : data.fileProfile};
    isolates = { isolates : data.fileMetadata};
    positions = {};
    links = { links : []};
    //console.log(data.fileNewick);
    newick = { newick : data.fileNewick[0]};

    query = "INSERT INTO datasets.datasets (name, key, user_id) VALUES ('"+data.datasetName+"', '"+data.key+"', '"+userID+"');" +
            "INSERT INTO datasets.profiles (dataset_id, data, schemeGenes) VALUES ("+1+", '"+JSON.stringify(profiles)+"', '{"+data['fileProfile_headers']+"}');" +
            "INSERT INTO datasets.isolates (dataset_id, data, metadata) VALUES ("+1+", '"+JSON.stringify(isolates)+"', '{"+data['fileMetadata_headers']+"}');" +
            "INSERT INTO datasets.positions (dataset_id, data) VALUES ("+1+", '"+JSON.stringify(positions)+"');" +
            "INSERT INTO datasets.links (dataset_id, data) VALUES ("+1+", '"+JSON.stringify(links)+"');" +
            "INSERT INTO datasets.newick (dataset_id, data) VALUES ("+1+", '"+JSON.stringify(newick)+"');"; 

    var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        client.end();
        callback();
      });
    });
  }

  uploadDataset(data, function(){
    callback();
  })

  
}


module.exports = router;