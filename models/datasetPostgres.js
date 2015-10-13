var phylovizDatasetModel = new Object({
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

console.log(phylovizDatasetModel);

module.exports = phylovizDatasetModel;