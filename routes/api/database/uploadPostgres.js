var express = require('express'); 
var router = express.Router();
var fs = require("fs"); 
var csv = require("fast-csv");
var multer = require('multer');
var crypto = require('crypto');

var done = true;

var countProgress = 0;

var config = require('../../../config.js');


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
  }
}), function(req, res) {

  var dataToDB = {};
  countProgress = 0;
  var alreadyError = false;
  var errorAuth = false;

  dataToDB.datasetName = req.body.datasetName;
  dataToDB.makePublic = req.body.makePublic;

  if (dataToDB.makePublic == 'true') dataToDB.is_public = true;
  else dataToDB.is_public = false;

  
  if (!req.isAuthenticated()){
    dataToDB.userID = "1";
    if (dataToDB.makePublic == 'true'){
      errorAuth = true;
    }
  }
  else dataToDB.userID = req.user.id;

  for (i in req.files){
    dataToDB['is_' + i] = true;
    readInputFiles(req.files[i].path, i, dataToDB, function(pathToFile, dataToDB){

          if(dataToDB['hasError'] != true || dataToDB['hasError'] == true && i == 'fileFasta') fs.unlink(pathToFile);
          countProgress += 1;
          if (countProgress == req.body.numberOfFiles && dataToDB['hasError'] != true && alreadyError != true){
              dataToDB.dataset_description = req.body.dataset_description;
              console.log("Uploading");
              uploadToDatabase(dataToDB, function(){
                if(dataToDB.data_type != 'newick') pLength = dataToDB.fileProfile_headers.length;
                else pLength = 1;
                var to_send = {datasetID: dataToDB.datasetID, hasError: dataToDB.hasError, errorMessage: dataToDB.errorMessage, numberOfProfiles: dataToDB.numberOfProfiles, profileLength: pLength};
                dataToDB = {};

                console.log("Uploaded");
                res.send(to_send);
              });
              
          }
          else if((dataToDB['hasError'] == true || errorAuth == true) && alreadyError != true){

            if(pathToFile.indexOf('.xls') > -1){
              dataToDB.errorMessage = "Excel files are not supported. Please convert it to a <i>Tab separated file</i>. More information on input files available <a href='/index/inputinfo'>here</a>.";
            }
            else if(errorAuth == true){
              dataToDB.errorMessage = "Login first to put a data set public.";
            }
            else {
              dataToDB.errorMessage = "Possible unsupported file type. For information on supported file types click <a href='/index/inputinfo'>here</a>.";
            }
            alreadyError = true;
            var to_send = {datasetID: dataToDB.datasetID, hasError: dataToDB.hasError, errorMessage: dataToDB.errorMessage, numberOfProfiles: dataToDB.numberOfProfiles, profileLength: pLength};
            dataToDB = {};
            res.send(to_send);
          }
    });
  }
  
});

router.post('/metadata', multer({
  dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename+Date.now() + fieldname;
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  limits: {
    files: 1
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path);
  }
}), function(req, res) {
  // Here you can check `Object.keys(req.files).length`
  // or for specific fields like `req.files.imageField`
  var dataToDB = {};
  countProgress = 0;
  dataToDB.datasetID = req.body.datasetID;
  var alreadyError = false;

  if (!req.isAuthenticated()) dataToDB.userID = "1";
  else dataToDB.userID = req.user.id;

  for (i in req.files){
    console.log(i);
    dataToDB['is_' + i] = true;
    readInputFiles(req.files[i].path, i, dataToDB, function(pathToFile, dataToDB){
          if(dataToDB['hasError'] != true || dataToDB['hasError'] == true && i == 'fileFasta') fs.unlink(pathToFile);
          countProgress += 1;
          if (countProgress == req.body.numberOfFiles && dataToDB['hasError'] != true){

              uploadMetadataToDatabase(dataToDB, function(){
                return res.send(dataToDB);
              });
              
          }
          else if(dataToDB['hasError'] == true && alreadyError != true){
            if(pathToFile.indexOf('.xls') > -1){
              dataToDB.errorMessage = "Excel files are not supported. Please convert it to a <i>Tab separated file</i>. More information on input files available <a href='/index/inputinfo'>here</a>.";
            }
            else {
              dataToDB.errorMessage = "Possible unsupported file type. For information on supported file types click <a href='/index/inputinfo'>here</a>."
            }
            alreadyError = true;
            return res.send(dataToDB);
          }
    });
  }
  
});


function readInputFiles(pathToFile, fileType, dataToDB, callback){
  if (fileType == 'fileNewick') {
    readNewickfile(pathToFile, fileType, dataToDB, function(dataToDB){
      return callback(pathToFile, dataToDB);
    })
  }
  else if (fileType == 'fileFasta') {
     readFastafile(pathToFile, fileType, dataToDB, function(dataToDB){
      return callback(pathToFile, dataToDB);
    })
  }
  else {
    readCSVfile(pathToFile, fileType, dataToDB, function(dataToDB){
      return callback(pathToFile, dataToDB);
    })
  }
}


function readCSVfile(pathToFile, fileType, dataToDB, callback){
  
  var stream = fs.createReadStream(pathToFile);

  dataToDB[fileType] = [];
  var getHeaders = true;
  var identifier;
  var headers = [];
  var callbackLaunched = false;


    csv.fromStream(stream, {headers : true, delimiter:'\t', quote: null})
      .on("data", function(data){
       if (getHeaders){
          for (i in data) headers.push(i);
          identifier = headers[0];
          if (fileType == 'fileProfile'){
            dataToDB.key = identifier;
            //headers.shift();
          } 
          if((dataToDB.key == undefined || dataToDB.key == 'phylovizFastaID') && fileType == 'fileMetadata') dataToDB.key = identifier.trim();

          if (dataToDB.key == 'phylovizFastaID'){
            for (i in dataToDB['fileFasta']){
              dataToDB['fileFasta'][i][dataToDB.key] = dataToDB['fileFasta'][i]['phylovizFastaID'];
              delete dataToDB['fileFasta'][i]['phylovizFastaID'];
            }
          }

          dataToDB[fileType + '_headers'] = headers; //remove first element from array. remove the identifier
          getHeaders = false;
        }
        for (i in data) data[i] = data[i].replace(/\'/g, '');
        dataToDB[fileType].push(data);
      })
      .on("end", function(){
        console.log("done");
        return callback(dataToDB);
      })
      .on("error",function(err){
        dataToDB['hasError'] = true;
        dataToDB['errorMessage'] = err.toString();
        if(callbackLaunched != true){
          callbackLaunched = true;
          return callback(dataToDB);
        }
      });


}

function readNewickfile(pathToFile, fileType, dataToDB, callback){

  dataToDB[fileType] = [];

  if(dataToDB.key == undefined) dataToDB.key = "phylovizNewickID";

  fs.readFile(pathToFile, 'utf8', function (err,data) {
      dataToDB[fileType].push(data);
      console.log('Newick done');
      return callback(dataToDB);
  });

}

function readFastafile(pathToFile, fileType, dataToDB, callback){

  dataToDB[fileType] = [];
  var fastaIDs = []
  var fastaSequences = []
  
  if(dataToDB.key == undefined) dataToDB.key = "phylovizFastaID";

  fs.readFile(pathToFile, 'utf8', function (err,data) {
      lines = data.split('\n')
      sequenceToPush = '';
      headers = {};
      headers[dataToDB.key] = '';
      for (i in lines){
        if (sequenceToPush != '' && lines[i].charAt(0) == '>'){
          var splitSequence = sequenceToPush.split('');
          fastaSequences.push(splitSequence);
          sequenceToPush = '';
        } 
        if (lines[i].charAt(0) == '>') fastaIDs.push(lines[i].substring(1, lines[i].length).trim());
        else{
         sequenceToPush += lines[i].trim();
        }
      }
      if(fastaIDs.length == 0){
        dataToDB['hasError'] = true;
        dataToDB['errorMessage'] = 'Error: There was an error uploading the FASTA file';
        return callback(dataToDB);
      }

      var splitSequence = sequenceToPush.split('');
      fastaSequences.push(splitSequence);

      var numberToChar = {};

      var fastaProfiles = fastaSequences.map(function(x){
        var newObject = {};
        newObject[dataToDB.key] = '';
        
        for(var i = 0; i < fastaSequences[0].length; i++){
          newObject['L' + String(i)] = 0;
        }
        return newObject;
      });


      for(var i= 0; i < fastaSequences[0].length; i++){
        numberToChar = {};
        countLetter = 0;
        headers['L' + String(i)] = '';

        for(j in fastaSequences){
          if (numberToChar.hasOwnProperty(fastaSequences[j][i])) fastaProfiles[j]['L' + String(i)] = String(numberToChar[fastaSequences[j][String(i)]]);
          else{
            countLetter += 1;
            numberToChar[fastaSequences[j][i]] = countLetter;
            fastaProfiles[j]['L' + String(i)] = String(numberToChar[fastaSequences[j][i]]);
          } 
        } 
      }

      for(i in fastaProfiles){
        fastaProfiles[i][dataToDB.key] = fastaIDs[i];
        dataToDB[fileType].push({profile: fastaProfiles[i], sequence: fastaSequences[i].join("")});
      }

      headerArray = [];

      for (i in headers) headerArray.push(i);

      dataToDB['fileProfile_headers'] = headerArray;

      console.log('Fasta done');
      return callback(dataToDB);
  });

}

function uploadToDatabase(data, callback){

  var pg = require("pg");
  var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

  if (data.fileMetadata == undefined) data.fileMetadata = [];
  if (data.fileProfile == undefined && data.fileFasta == undefined) data.fileProfile = [];
  if (data.fileFasta != undefined) data.fileProfile = data.fileFasta;
  if (data.fileNewick == undefined) data.fileNewick = [];
  if (data['fileMetadata_headers'] == undefined) data['fileMetadata_headers'] = [];


  function uploadDataset(data, callback){

    var userID = data.userID;
    data.numberOfProfiles = data.fileProfile.length;
    var profiles = { profiles : data.fileProfile};
    var isolates = { isolates : data.fileMetadata};
    var positions = {};
    var links = { links : []};
    var newick = { newick : data.fileNewick[0]};

    var cipher = crypto.createCipher(config.cipherUser.algorithm, config.cipherUser.pass);
    dataset_id = userID + data.datasetName + getDateTime();
    data.datasetID = cipher.update(dataset_id,'utf8','hex');
    if (data['is_fileNewick']) data.data_type = 'newick';
    if (data['is_fileFasta']) data.data_type = 'fasta';
    if (data['is_fileProfile']) data.data_type = 'profile'; 

    if (data.data_type != 'newick') data['fileProfile_headers'] = data['fileProfile_headers'].toString().replace(/'/g, '&39').split(',');
    data['fileMetadata_headers'] = data['fileMetadata_headers'].toString().replace(/'/g, '&39').split(',');

    let query = "INSERT INTO datasets.datasets (name, key, user_id, dataset_id, data_type, description, put_public, is_public, data_timestamp) VALUES ('"+data.datasetName+"', '"+data.key.replace(/'/g, '&39')+"', '"+userID+"', '"+data.datasetID+"', '"+data.data_type+"', '" + data.dataset_description +"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());" +
            //"INSERT INTO datasets.profiles (user_id, data, schemeGenes, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', '"+JSON.stringify(profiles).replace(/'/g, '&39')+"', '{"+data['fileProfile_headers']+"}', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());" +
            //"INSERT INTO datasets.isolates (user_id, data, metadata, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', '"+JSON.stringify(isolates).replace(/'/g, '&39')+"', '{"+data['fileMetadata_headers']+"}', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());" +
            "INSERT INTO datasets.positions (user_id, data, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', '"+JSON.stringify(positions)+"', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());" +
            "INSERT INTO datasets.links (user_id, data, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', '"+JSON.stringify(links).replace(/'/g, '&#39')+"', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());" +
            "INSERT INTO datasets.newick (user_id, data, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', '"+JSON.stringify(newick)+"', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());";

    var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        data.hasError = true;
        data.errorMessage = 'Could not connect to database.'; //+ err.toString();
        return callback(data);
      }

      
      var countBatches = 0;
      var pTouse = {};
      var completeBatches = 0;
      
      while(profiles.profiles.length){
        countBatches+=1;
        pTouse[countBatches] = {profiles: profiles.profiles.splice(0, config.batchSize)}; 
        console.log(profiles.profiles.length);
        console.log('BATCH ', countBatches);

        var profileQuery = "INSERT INTO datasets.profiles (user_id, data, schemeGenes, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', $1, '{"+data['fileProfile_headers']+"}', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());";

          client.query(profileQuery, [pTouse[countBatches]], function(err, result) {
            completeBatches += 1;
            if(err) {
              data.hasError = true;
              data.errorMessage = 'Could not upload input data. Possible unsupported file type. For information on supported file types click <a href="/index/inputinfo">here</a>.'; //+ err.toString();
              return callback(data);
            }

          });
      }


      var isolateQuery = "INSERT INTO datasets.isolates (user_id, data, metadata, dataset_id, put_public, is_public, data_timestamp) VALUES ('"+userID+"', $1, '{"+data['fileMetadata_headers']+"}', '"+data.datasetID+"', '"+ data.makePublic +"', '"+ data.is_public + "', NOW());";
      
      client.query(isolateQuery, [isolates], function(err, result) {
        if(err) {
          data.hasError = true;
          data.errorMessage = 'Could not upload input data. Possible unsupported file type. For information on supported file types click <a href="/index/inputinfo">here</a>.'; //+ err.toString();
          return callback(data);
        }

        client.query(query, function(err, result) {
          if(err) {
            data.hasError = true;
            data.errorMessage = 'Could not upload input data. Possible unsupported file type. For information on supported file types click <a href="/index/inputinfo">here</a>.'; //+ err.toString();
            return callback(data);
          }
          client.end();
          while(completeBatches != countBatches){
            console.log(completeBatches, countBatches);
          }

          return callback(data);
        });
      });

      });
  }

  uploadDataset(data, function(dataObject){
    return callback(dataObject);
  })

  
}

function uploadMetadataToDatabase(data, callback){

  var pg = require("pg");
  var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;


  function uploadDataset(data, callback){
    let userID = data.userID;
    let isolates = { isolates : data.fileMetadata};

    let query = "UPDATE datasets.isolates SET data = '"+JSON.stringify(isolates)+"' WHERE user_id = '"+userID+"' AND dataset_id = '"+data.datasetID+"';" +
            "UPDATE datasets.isolates SET metadata = '{"+data['fileMetadata_headers']+"}' WHERE user_id = '"+userID+"' AND dataset_id = '"+data.datasetID+"';";

    var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        data.hasError = true;
        data.errorMessage = 'Could not connect to database.';
        return callback(data);
      }
      client.query(query, function(err, result) {
        if(err) {
          console.log(error);
          data.hasError = true;
          data.errorMessage = 'Could not update auxiliary data. Possible unsupported file type. For information on supported file types click <a href="/index/inputinfo">here</a>.'; //+ err.toString();
          return callback(data);
        }
        client.end();
        return callback(data);
      });
    });
  }

  uploadDataset(data, function(dataObject){
    return callback(dataObject);
  })

  
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}


module.exports = router;