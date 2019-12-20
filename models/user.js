const validator = require ('validator');
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {Session} = require('./session');
const {Connection} = require('./connection');
const {hashTag, emailInfo, newUser} = require ('../db/dataConfig')
const functionMatch = 

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: 	validator.isEmail,
			message: '{VALUE} is not a valid email.'
		},
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	displayName: {
		type: String
		validate: {
			validator: val => !validator.isEmail(val),
			message: '{VALUE} is an email address. Email addresses cannot be used as display names.'
		}
	},
	tokens: [
		{
			access: {
				type: String
			},
			persist: {
				type: Boolean,
			},
			token: {
				type: String,
			}
		}
	],
	failedLogins: {
		type: Number
	},
	lastFailedLogin: {
		type: Date
	},
	groups: [
		{
			type: mongoose.Schema.Types.ObjectId
		}
	],
	friends: [
		{
			type: mongoose.Schema.Types.ObjectId
		}
	],
	connection:
	{
		type: mongoose.Schema.Types.ObjectId
	},
	invites: {
		type: mongoose.Schema.Types.ObjectId
	},
	invitations {
		type: mongoose.Schema.Types.ObjectId
	}
});

UserSchema.methods.toJSON = function () {
	const {displayName, name, attentions} = this;
	return {displayName, name, attentions}
}

UserSchema.methods.getFriendsList = function(){
	Friend.find({'_id': {
		$in: this.friends;
	}}).then(friendsList => {
		retval = {};
		for (const i in friendsList){
			const {}
			retval[]
		}
	})
}

UserSchema.methods.generateAuthToken = function (persist) {
	let user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, hashTag).toString();
	user.tokens = user.tokens.concat([{access, persist, token}]);
	return user.save().then(() => token);
}

UserSchema.statics.findByToken = function (token) {
	const User = this;
	let decoded;
	try {
		decoded = jwt.verify(token, hashTag)
	}
	catch (e) {
		return Promise.reject({status: 403, message: 'Invalid token provided'});
	}
	return User.findOne({
		'_id': decoded._id,
	}).then(user => {
		for (const i in user.tokens){
			if (user.tokens[i].token === token){
				return user;
			}
		}
		return Promise.reject();
	}).catch(() => Promise.reject({status:403, message: 'Invalid token provided.'}))
}

UserSchema.statics.findByEmailOrDisplayName = (name) => {
	this.find( { email: { $text: { $search: name } } } ).lean().then( users => {
		//if it's an email, no need to search displayNames.
		return validator.isEmail(name) ? users : this.find( { displayName : { $text: { $search: name } } } ).lean().then(additional => [...users, ...additional])
	})
}

UserSchema.methods.removeToken = function (token, disconnecting) {
	var user = this;
	const {tokens} = user;
	for (const i in tokens){
		if (tokens[i].token === token && !(disconnecting && tokens[i].persist)){
			tokens.splice(i, 1)
			return user.updateOne({
				$set:{
					tokens
				}
			}).then(() => console.log('token deleted')).catch(err => Promise.reject({status: 500, message: 'Error deleting token.'}) )
		}
	}
	return Promise.reject({status: 400, message: "No such token for this user."})
}

UserSchema.methods.mail = async function (subject, message) {
	const {user, site, password} = emailInfo;
	let transporter = nodemailer.createTransport({
		host: site,
		port: 587,
		secure: false,
		auth: {
			user,
			pass
		},
	    tls: {
	        rejectUnauthorized: false
	    }
	})
	let info = await transporter.sendMail({
		from: '"Information Services" <' + email + '>',
		to: this.email,
		subject,
		html: message 
	})
}

UserSchema.methods.attention = function (attention, value) {
	var user = this;
	target = 'attentions.'+attention
	return user.update({
		$set: {
			[target]: value
		}
	})
}

UserSchema.statics.findByCredentials = function (displayName, password) {
	return User.findOne({displayName}).then( user => {
		if (user && (user.failedLogins > 3 && user.lastFailedLogin && Date.now()-user.lastFailedLogin < 1200000)){
			user.update({
				$set: {
					lastFailedLogin: Date.now()
				}
			})
			return Promise.reject({status: 403, message: 'Too many failed login attempts. Please try again later.'})
		}
		if (!user) {
			return Promise.reject({status: 400, message: jwt.sign({_id: newUser.toHexString(), access}, hashTag).toString()});
		}
		const salty = bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				return hash;
			}); 
		});
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, salty, (err, res) => {
				if (res){
					user.update({
						$set: {
							failedLogins: 0
						}
					});
					resolve (user);
				}
				else {
					user.update({
						$set: {
							failedLogins: Date.now() - user.lastFailedLogin >= 1200000 ? 1 : parseInt(user.failedLogins)+1,
							lastFailedLogin: Date.now()
						}
					})
					if (user.failedLogins === 3){
						user.sendEmail('Notification regarding your account', 'Your account has had too many failed logins triggered. If you need to reset your password, please notify us.');
					}
					reject({status: 403, message: 'Invalid password.'});
				}
		})
	})
	.catch(err => Promise.reject(err));
}

UserSchema.pre('save', function (next) {
	var user = this;
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			}); 
		});
	}
	if (user.isModified('displayName')){
		if (user.displayName.contains('@') && user.displayName.substring(user.displayName.indexOf('@')).)
	}
	else {
		next();
	}
})

const User = mongoose.model('User', UserSchema);		

module.exports = {User};