'use strict'

const goeBURST = require('goeBURST');
const config = require('./config.js');
const kue = require('kue');
const queue = kue.createQueue();
const pg = require("pg");
const connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    auth: {
        user: config.email,
        pass: config.spe
    }
}));

const createPhyloviZInput = require('phyloviz_input');
const phyloviz_input_utils = require('phyloviz_input_utils')(config);


const getEmail = (userID, cb) => {

    let query = "SELECT email FROM datasets.users WHERE user_id = '"+String(userID)+"';";

    const client = new pg.Client(connectionString);

    client.connect( (err) => {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query(query, (err, result) => {
            if(err) {
              return console.error('error running query', err);
            }
            cb(result.rows[0].email);
        });
    });
};

const clock = (start) => {
    if ( !start ) return process.hrtime();
    const end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
};


const sendMail = (mailInfo, cb) => {

    // setup e-mail data with unicode symbols
    const mailOptions = {
        from: config.title + ' <phylovizonline@gmail.com>', // sender address
        to: mailInfo.email, // list of receivers
        subject: 'Phyloviz - New Dataset', // Subject line
        text: mailInfo.message, // plaintext body
    };
    
    // send mail with defined transport object
    transporter.sendMail( mailOptions, (error) => {
        if(error){
            return console.log(error);
        }
        cb(null, mailOptions);

    });
};

console.log('Process queue');

queue.process( 'goeBURST', (job, jobDone) => {

	const start = clock(); //Timer
	let datasetId;
    const datasetID = job.data.datasetID;
    const userID = job.data.userID;
    const algorithmToUse = job.data.algorithmToUse;
    const analysis_method = job.data.analysis_method;
    const missings = job.data.missings;
    const save = job.data.save;
    const send_email = job.data.sendEmail;
    const missing_threshold = job.data.missing_threshold;
    const parent_id = job.data.parent_id;
    const mailObject = {};

	if(datasetID !== undefined){

		loadProfiles( datasetID, (profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles, entries_ids) => {
			datasetId = datasetID;
			const old_profiles = profiles;

			goeBURST( profileArray, identifiers, algorithmToUse, missings, analysis_method, missing_threshold, (links, distanceMatrix, profilegoeBURST, indexToRemove, maxDistance) => {
				if(save){
					saveLinks( datasetID, links, missings, () => {
						let goeburstTimer = clock(start);
						const min = (goeburstTimer/1000/60) << 0;
						const sec = (goeburstTimer/1000) % 60;
						goeburstTimer = min + ':' + sec;

						save_profiles( profilegoeBURST, old_profiles, datasetID, indexToRemove, entries_ids, analysis_method, missing_threshold, goeburstTimer, parent_id, () => {
							phyloviz_input_utils.getNodes( datasetID, userID, false, (dataset) => {
								createPhyloviZInput( dataset, (graphInput) => {
									graphInput.distanceMatrix = distanceMatrix;
									graphInput.maxDistanceValue = maxDistance;

									phyloviz_input_utils.addToFilterTable( graphInput, userID, datasetID, [], () => {
										saveLinks( datasetID, graphInput.links, missings, () => {
											console.log('ADDED TO FILTER');
											if(send_email){
												getEmail( userID, (email) => {
													mailObject.email = email;
													mailObject.message = 'Your data set is now available at: ' + config.final_root + '/main/dataset/' + datasetID;
													sendMail( mailObject, () => {
														console.log('Mail sent');
													});
												});
											}
											jobDone();
										});
									});
								  });
							});
						});
					});
				}
				else{
					jobDone();
				}
			});
		});
	}
	else jobDone();

});


const loadProfiles = (datasetID, cb) => {

    console.log("load profiles");

    let identifiers = {};
    let countProfiles = 0;
    let profileArray = [];
    let profiles = [];
    let entries_ids = [];

    const pg = require("pg");
    const connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
    const client = new pg.Client(connectionString);


    const processQueryResults = (result, cb) => {

        console.log("process");

        let counter = 0;
        let data_type, schemeGenes = "";

        for(let row in result.rows) {
            counter += 1;
            let resultObject = result.rows[row];
            if (resultObject.hasOwnProperty('data')) {
                profiles = profiles.concat(result.rows[row].data.profiles);
                entries_ids.push(result.rows[row].id);
            }
            else if (resultObject.hasOwnProperty('data_type')) data_type = result.rows[row].data_type;
            else if (resultObject.hasOwnProperty('schemegenes')) schemeGenes = result.rows[row].schemegenes;

            if (counter === result.rows.length) cb(data_type, schemeGenes);
        }
    };

    client.connect( (err) => {
        if(err) {
            return console.error('could not connect to postgres', err);
        }

        const query = "SELECT data_type FROM datasets.datasets WHERE dataset_id = '"+datasetID+"';" +
            "SELECT data, id FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';" +
            "SELECT schemeGenes FROM datasets.profiles WHERE dataset_id = '"+datasetID+"';";

        client.query( query, (err, result) => {
            if(err) {
                return console.error('error running query', err);
            }

            processQueryResults(result, (data_type, schemeGenes) => {

                console.log()
                let existsProfile = {};
                let dupProfiles = [];
                let dupIDs = [];
                let existsIdentifiers = {};

                console.log('before', profiles.length);

                let counter_processed_profiles = 0;

                profiles.forEach( (profile) => {

                    counter_processed_profiles += 1;

                    if(data_type === 'fasta') profile = profile.profile;

                    const arr = schemeGenes.map( (d) => { return profile[d]; });
                    const identifier = arr.shift();

                    existsProfile[String(arr)] = true;
                    identifiers[countProfiles] = identifier;
                    existsIdentifiers[identifier] = true;
                    countProfiles += 1;
                    profileArray.push(arr);

                    if(counter_processed_profiles === profiles.length) {
                        cb(profileArray, identifiers, datasetID, dupProfiles, dupIDs, profiles, entries_ids);
                    }
                });

            });
            client.end();
        });
    });


};

const saveLinks = (datasetID, links, missings, cb) => {

    const pg = require("pg");
    const connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
    const client = new pg.Client(connectionString);

    const linksToUse = { links: links, missings: missings };

    const query = "UPDATE datasets.links SET data = '"+JSON.stringify(linksToUse)+"' WHERE dataset_id ='"+datasetID+"';";

    client.connect( (err) => {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query(query, (err) => {
            if(err) {
                return console.error('error running query', err);
            }
            client.end();
            cb();
        });
    });
};

const save_profiles = (profilegoeBURST, profiles, datasetID, indexesToRemove, entries_ids, analysis_method, missing_threshold, goeburst_timer, parent_id, cb) => {

    const pg = require("pg");
    const connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
    const client = new pg.Client(connectionString);

    const profilesToUse = { profiles: profiles, indexestoremove: indexesToRemove, profilesize: profilegoeBURST[0].length };

    client.connect( (err) => {
        if(err) {
            data.hasError = true;
            data.errorMessage = 'Could not connect to database.'; //+ err.toString();
            return cb(data);
        }

        let pTouse = {};
        let countEntries = 0;
        let countBatches = 0;
        let completeBatches = 0;

        while(profilesToUse.profiles.length){
            countBatches+=1;
            if(countBatches === 1){
                pTouse[countBatches] = { profiles: profilesToUse.profiles.splice(0, config.batchSize), indexestoremove: indexesToRemove, profilesize: profilegoeBURST[0].length, analysis_method:analysis_method, missing_threshold: missing_threshold, goeburst_timer: goeburst_timer, parent_id:parent_id};
            }
            else{
                pTouse[countBatches] = { profiles: profilesToUse.profiles.splice(0, config.batchSize)};
            }

            const queryUpdate = "UPDATE datasets.profiles SET data = $1 WHERE dataset_id ='"+datasetID+"' AND id ='"+String(entries_ids[countEntries])+"';";

            client.query(queryUpdate, [pTouse[countBatches]], (err) => {
                completeBatches += 1;
                if(err) {
                    data.hasError = true;
                    data.errorMessage = 'Could not upload input data. Possible unsupported file type. For information on supported file types click <a href="/index/inputinfo">here</a>.'; //+ err.toString();
                    return cb(data);
                }
                if (countBatches === completeBatches){
                    cb();
                }

            });
            countEntries+=1;
        }
    });

};