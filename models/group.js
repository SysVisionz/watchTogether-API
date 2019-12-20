import ObjectManager from 'svz-object-manager';
import socketIO from 'socket.io';
import mongoose from 'mongoose';
import {User} from './user';

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
	session: {
		type: mongoose.Schema.Types.ObjectId
	},
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
			id: user._id
		})
	})
}

GroupSchema.methods.getUser = index => {
	return User.findByIdthis.users[index]

const Group = mongoose.model('Group', GroupSchema);		

module.exports = {Group};