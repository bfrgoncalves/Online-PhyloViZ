var restful = require('node-restful');
var mongoose = restful.mongoose;


var datasetSchema = new mongoose.Schema({
	name: String,
	key: String,
	schemeGenes: Array,
	metadata: Array,
	profiles: Object,
	isolates: Object,
 	links: Array,
	positions: Object,
	newick: String
});

module.exports = restful.model('datasets', datasetSchema);