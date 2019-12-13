const http = require ('http');
const path = require ('path');
const express = require ('express');
const socketIO = require ('socket.io');
const _ = require ('lodash');
const {MongoClient} = require ('mongodb');
const jwt = require ('jsonwebtoken');
const {mongoose, hashTag} = require ('./db/dataConfig');
const {authenticate, contact} = require('./middleware');
const {Connection, Session, Guest} = require('./models');
const cron = require("node-cron");

var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);
app.use(express.json())

cron.schedule("* * * * * 1", () => Guest.find().each(guest => guest.cleanup()))

const token = input => jwt.sign(input, hashTag);

var mongoclient = new MongoClient("localhost", 27017);

const connected = {
	guests: {},
	users: {}
}
let guests = 0;

io.on('connection', socket => {
	socket.on('init', data => authenticate.init(token, socket, connected))
	socket.on('signIn', data => {
//		if connectedUsers value isn't true or undefined, it is the timeout, so cancel it because we're logging back in.
		for (const i in connected) {
			if (![undefined, true].includes(connected[i][token].isConnected) ){
				clearTimeout(connected.users[token]);
				connectedUsers[token] = true;
			}
		}
//		connectedUsers[token] cannot be set before the test, because the timeout delete will still run if we do that.
		socket.token = token;
		connectedUsers[token] = true;
	});
	socket.on('logout', token => {
		delete connectedUsers[token];
	})
	socket.on('disconnect', () => {
		if (socket.type === "guest"
	});
	socket.on('joinSession', data => {
		Session.findOne({_id: data._id}).then(session => {
			User.findByToken(token).then(user => {
				session.join(user)
			}
		})
	};
	socket.on('joinChat', data => {
		Chat.findOne({_id: data._id}, chat => {
			User.findOne({})
		})
	});
	socket.on('chatPost', message => {
		
	});
	socket.on('chatEdit', message => {
		User.findByToken(token).then(user => {

		})
	});
})

app.post('/users', authenticate.newUser);

app.get('/users/me', authenticate.authByToken)

app.delete('/users/logout', authenticate.logout);

app.post('/users/search', authenticate.returnUsers);

app.post('/users/login', authenticate.login);

app.post('/users/update', authenticate.updateUser);

app.post('/group/promote', group.promoteUser);

app.post('/group/pass', group.passOwner);

app.post ('/group', group.make);


server.listen(8086, () => console.log('server up on port 8086'));