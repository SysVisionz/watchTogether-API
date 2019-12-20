import Invite from './invite'
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
	currentUsers: [
		{
			mongoose.Schema.Types.ObjectId
		}
	],
	invitedUsers: [
		{
			type: mongoose.Schema.Types.ObjectId
		}
	],
	checkin: {
		type: Object
	}
});

SessionSchema.methods.joinSession = function (id, currentTime){
	if (this.invitedUsers.includes(id) || this.allowUnsigned){
		this.currentUsers.push({time: currentTime, })
	}
	this.markModified('currentUsers')
}

SessionSchema.userPaused = {
	
}

SessionSchema.methods.leaveSession = function (id){

}

SessionSchema.methods.emit = function (type, message, socket) {
	socket.broadcast.to(this._id).emit(type, message)
}

SessionSchema.methods.checkin = function(){
	return User.find({_id: {$in: currentUsers}}).then(users => {
		const checkins = {};
		let min = 0;
		let max = 0;
		for (const i in users){
			if (!users[i].checkin){
				return;
			}
			const {id, checkin} = users[i]
			const {time, date} = checkin;
			checkins[id] = {time, latency: new Date() - date}
			const curTime = checkins[id].time*1000 + checkins[id].latency
			min = curTime < min ? curTime : min;
			max = curTime > max ? curTime : max;
		}
		for (const i in users)
		if (max-min > 2000){
			return 
		}
	})
}

SessionSchema.methods.removeToken = function (token, disconnecting) {
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

SessionSchema.methods.mail = async function (subject, message) {
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

SessionSchema.methods.attention = function (attention, value) {
	var user = this;
	target = 'attentions.'+attention
	return user.update({
		$set: {
			[target]: value
		}
	})
}

SessionSchema.statics.findByCredentials = function (email, password) {
	return Session.findOne({email}).then( user => {
		if (user && (user.failedLogins > 3 && user.lastFailedLogin && Date.now()-user.lastFailedLogin < 1200000)){
			user.update({
				$set: {
					lastFailedLogin: Date.now()
				}
			})
			return Promise.reject({status: 403, message: 'Too many failed login attempts. Please try again later.'})
		}
		if (!user) {
			return Promise.reject({status: 400, message: 'Session does not exist'});
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

SessionSchema.pre('remove', function (next) {
	Invite.find({session: this._id}).then(invites) {
		for (const i in invites){
			if (type === 'session'){
				invites[i].remove();
			}
			else {
				invites[i].remove('session');
			}
		}
		return 	next();
	}
})

const Session = mongoose.model('Session', SessionSchema);		

module.exports = {Session};