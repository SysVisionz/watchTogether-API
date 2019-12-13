const validator = require ('validator');
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {hashTag} = require ('../db/dataConfig')
const {User} = require('./user')

const ChatSchema = new mongoose.Schema({
	category: {
		type: String,
		required: true
	},
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true
		}
	],
	content: [
		{
			type: Object,
		}
	],
	roomId: {
		type: String
	}
});

ChatSchema.methods.getNames = function(currentUsers, userList = this.users){
	if (userList[0]){
		users = {...namesList}
		const user = users.splice(0, 1);
		if (user._id){
			return User.findOne({_id: user._id}) {

			}
		}
	}
}

ChatSchema.methods.getChat = function() {
	return this.content
}

ChatSchema.methods.leaveChat = function (token, ) {

}

ChatSchema.methods.findFriendChat = function(user, friend) {
	return 
}

ChatSchema.methods.boot = function (token, id){
	return User.findByToken(token).then(user => {
		switch(this.type){

			'session':
		}
	}
}

const Chat = mongoose.model('Chat', ChatSchema);		

module.exports = {Chat};