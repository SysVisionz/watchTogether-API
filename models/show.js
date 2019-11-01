const validator = require ('validator');
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {hashTag} = require ('../db/dataConfig')

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
	},
	photoUrl: {
		type: String,
		validate: {
			validator: validator.isURL,
			message: '{VALUE} is not a valid image file.'
		}
	},
	name: {
		type: String
	},
	address: {
		street1: {
			type: String,
			minlength: 1
		},
		street2: {
			type: String,
		},
		city: {
			type: String,
			minlength: 1
		},
		state: {
			type: String,
			minlength: 1
		},
		zip: {
			type: String,
			minlength: 1
		}
	},
	type: {
		type: String,
		required: true
	},
	business: {
		type: String
	},
	website: {
		type: String,
		minlength: 1,
		validate: {
			validator: validator.isURL,
			message: '{VALUE} is not a valid URL'
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
	attentions: {
		contact: {
			type: Boolean
		},
		project: {
			type: Boolean
		},
		schedule: {
			type: Boolean
		},
		invoices: {
			type: Boolean
		}
	},
	invoices: [
		{
			type: mongoose.Schema.Types.ObjectId
		}
	],
	failedLogins: {
		type: Number
	},
	lastFailedLogin: {
		type: Date
	}
});

UserSchema.methods.toJSON = function () {
	var user = this;
	var userObject = user.toObject();
	return _.pick(userObject, ['email', 'address', 'photoUrl', 'name', 'business', 'website', 'type', 'contractSigned', 'attentions'])
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

UserSchema.methods.sendEmail = async function (subject, message) {
	let transporter = nodemailer.createTransport({
		host: 'brennan-landscaping.com',
		port: 587,
		secure: false,
		auth: {
			user: 'info',
			pass: 'e-D9:^xA],(q%%'
		},
	    tls: {
	        rejectUnauthorized: false
	    }
	})
	let info = await transporter.sendMail({
		from: '"Information Services" <info@brennan-landscaping.com>',
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

UserSchema.statics.attentionAll = function(attention, minClearance, contact) {
	if (minClearance === 'master') {
		return User.find({
			type: 'master'
		}).then(masters => {
			for (const master of masters){
				master.attention('project', true);
				if (contact){
					User.findOne({'_id': contact.user}).then( user => {
						const content = contact.type + ' from ' + (user ? (user.personal.name ? user.personal.name : user.email) : contact.email);
						const email = contact.toEmail().then(email => {
							master.sendEmail(content, email)
						}).catch(error => error);
					}).catch(err => console.log(err));
				}
			}
		})
	}
	else if (minClearance === 'admin'){
		return User.find({
			type: {
				$in: [
					'admin', 
					'master'
				]
			}
		}).then(admins => {
			for (const admin of admins){
				admin.attention('contact', true);
				if (contact){
					User.findOne({'_id': contact.user}).then( user => {
						const content = contact.type + ' from ' + (user ? (user.personal.name ? user.personal.name : user.email) : contact.email);
						const email = contact.toEmail().then(email => {
							admin.sendEmail(content, email)
						}).catch(error => error);
					}).catch(err => err);
				}
			}
		})
	}
	else {
		return User.find().then(users => {
			for (const user of users){
				user.attention('contact', true);
				if (contact){
					User.findOne({'_id': contact.user}).then( user => {
						admin.sendEmail(contact.type + ' contact from ' + (user ? (user.personal.name ? user.personal.name : user.email) : contact.email), contact.toEmail())
					}).catch(err => console.log(err));
				}
			}
		})
	}
}

UserSchema.statics.findByCredentials = function (email, password) {
	return User.findOne({email}).then( user => {
		if (user && (user.failedLogins > 3 && user.lastFailedLogin && Date.now()-user.lastFailedLogin < 1200000)){
			user.update({
				$set: {
					lastFailedLogin: Date.now()
				}
			})
			return Promise.reject({status: 403, message: 'Too many failed login attempts. Please try again later.'})
		}
		if (!user) {
			return Promise.reject({status: 400, message: 'User does not exist'});
		}
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
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
	else {
		next();
	}
})

const User = mongoose.model('User', UserSchema);		

module.exports = {User};