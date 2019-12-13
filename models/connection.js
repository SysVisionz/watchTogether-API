const mongoose = require('mongoose');
const {User} = require('./user');
const {Session} = require('./session');

const ConnectionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId
	},
	type: {
		type: String,
		required: true
	},
	lastAction: {
		type: Date,
		required: true
	},
	session: {
		type: mongoose.Schema.Types.ObjectId
	},
	active: {
		type: Boolean
	},
	socket: {
		type: Object
	}
	checkin: {
		type: Object
	}
});

ConnectionSchema.post('create', function (doc, next){
	this.socket.on('login', this.login)
	this.socket.on('init', (data) => {
		const {token} = data;
		socket.token = token;
		if (connectionsEnding[socket.token]){
			clearTimeout(connectionsEnding[socket.token]);
			connectionsEnding[socket.token] = undefined;
		}
	});
	this.socket.on('createSession', (user, _id) => {
		Session.findOne({_id}).then( session => {
			!session 
		});
	})
	this.socket.on('invite', user => {
		socket.session.push
	})
	this.socket.on('adminRequest', ())
	this.socket.on('adminResponse', (token, users, group) => {

	})
	this.socket.on('joinSession', (token, ))
	this.socket.on('disconnect', () => {
		this.user ? 
	});
})

ConnectionSchema.methods.login = function (data) {
	const {token} = data;
	if (!token){
		return Promise.reject({status: 400, message: "Invalid Token Provided."})
	}
	return User.findByToken(token).then(user => {
		user.connections.push(this._id);
		user.markModified(connections)
		return user.save().then(() => {
			this.user = user._id;
			return this.save()
		})
	})
}

ConnectionSchema.methods.checkin = function(time){
	date = new Date();
	this.checkin = {date, time}
	return Session.findOne({_id: this.session}).then(session => {
		if (!session){
			return Promise.reject({status: 400, message: "Invalid Session."})
		}
		return session.checkin;
	})
}

ConnectionSchema.methods.send = function (type, data) {
	return Session.findOne({id: this.session}).then(session => {
		if (!session){
			return Promise.reject({status: 400, message: "Invalid Session Id Provided."})
		}
		switch(type){
			case 'change':
				this.sendChange(data.type, session.users[user].type, data.value)
			case 'check-in':
				this.session.checkin(data.time)
		}
	})
}

ConnectionSchema.methods.receive = function (message) {

}

const Connection = mongoose.model('Connection', ConnectionSchema);		

module.exports = {Connection};