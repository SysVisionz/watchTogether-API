const validator = require ('validator');
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const {Chat} = require('./chat'); 

const GuestSchema = new mongoose.Schema({
	displayName: {
		type: String
	},
	active: {
		type: Boolean
	},
	token: {
		type: String
	},
	chats: [
		{
			type: mongoose.Schema.Types.ObjectId
		}
	],
	lastLogin: {
		type: Date
	},
	socket: {
		type: Object
	},
	session: {
		mongoose.Schema.Types.ObjectId
	}
});

GuestSchema.methods.generateAuthToken = function (persist) {
	var access = 'auth';
	this.token = jwt.sign({_id: user._id.toHexString(), access}, hashTag).toString();
	return this.save().then(() => this.token);
}

GuestSchema.methods.sendChat = function(message) {
	return Chat.findOne({_id: this.chatId}).then(chat => {
		chat.messages.push({
			displayName: this.displayName,
			message
		})
		chat.markModified('messages');
		.then(() => chat.save().then(() => this.socket.broadcast))
	})
}

GuestSchema.methods.generateAuthToken = function (persist) {
	this.token = jwt.sign({_id: user._id.toHexString(), 'auth'}, hashTag).toString();;
	return this.save().then(() => token);
}

GuestSchema.methods.cleanup = function() {
	if (new Date() - this.lastLogin > 3888000000){
		this.remove();
	}
}

GuestSchema.methods.disconnect = function(){
	this.lastLogin = new Date();
	this.socket = null;
	return this.save();
}

const Guest = mongoose.model('Guest', GuestSchema);		

module.exports = {Guest};