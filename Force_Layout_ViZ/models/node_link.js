var mongoose = require('mongoose')
	, Schema = mongoose.Schema;


var node_link_Schema = new Schema({
	id : { type: Number, required: true, trim:true, index: { unique:true } },
	name : { type: String, required: true, trim:true, index: { unique:true } },
	description : { type: String, required:true }
})

var NLSchema = mongoose.model('node_link_Schema', node_link_Schema);

module.exports = {
	Node_Link : NLSchema
};