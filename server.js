const http = require ('http');
const path = require ('path');
const express = require ('express');
const socketIO = require ('socket.io');
const _ = require ('lodash');
const {MongoClient} = require ('mongodb');
const jwt = require ('jsonwebtoken');
const {mongoose, hashTag} = require ('./db/dataConfig');
const {authenticate, contact} = require('./middleware');
const {User} = require('./models');

var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);
app.use(express.json())

const token = input => jwt.sign(input, hashTag);

var mongoclient = new MongoClient("localhost", 27017);

const connectionsEnding = {};

const connectedUsers = {};

io.on('connection', socket => {
	socket.on('login', (data) => {
		const {token} = data;
		if (connectedUsers[token]){
			connectedUsers[token].push(socket.id);
		}
		else {
			connectedUsers[token] = [socket.id];
		}
		socket.token = token;
		if (connectionsEnding[socket.token]){
			clearTimeout(connectionsEnding[socket.token]);
			connectionsEnding[socket.token] = undefined;
		}
	});
	socket.on('disconnect', () => {
		if (connectedUsers[socket.token]){
			connectedUsers[socket.token].splice(connectedUsers[socket.token].indexOf(socket.id), 1);
			connectionsEnding[socket.token] = setTimeout(() => authenticate.logoutNonPersistent(socket.token), 30000);
		}
	});
});


app.post('/users', authenticate.newUser);

app.get('/users/me', authenticate.authByToken)

app.post('/users/promote', authenticate.promoteUser);

app.delete('/users/logout', authenticate.logout);

app.post('/users/paid')

app.post('/users/search', authenticate.returnUsers);

app.post('/users/login', authenticate.login);

app.post('/users/update', authenticate.updateUser);

server.listen(8086, () => console.log('server up on port 8086'));