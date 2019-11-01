const mongoose = require('mongoose');
const _ = require('lodash');

const GroupSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
		minlength: 1
	},
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true
		}
	]
	,
	admin: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true
		}
	],
	history: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	}
})

const Group = mongoose.model('Group', GroupSchema);		

module.exports = {Group};