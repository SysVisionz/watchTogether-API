import ObjectManager from 'svz-object-manager';
const socketIO = require('socket.io')
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
		minlength: 1
	},
	users: [
		{
			type: Object,
			required: true
		}
	],
	admin: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true
		}
	],
	invited: [
		{
			type: Object
		}
	],
	history: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	group: {
		type: Object
	}
})

GroupSchema.methods.addUser = (type, token) => {
	User.findByToken(token).then(user => {
		this.users.push({
			name: null,
		})
	})
}

const Group = mongoose.model('Group', GroupSchema);		

module.exports = {Group};