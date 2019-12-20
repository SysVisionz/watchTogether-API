const jwt = require ('jsonwebtoken');
const {User, Group} = require('../models');
import {hashTag, newUser} from '../db/dataConfig';

const decrypt = input => {

}

const authByToken = (req, res) => {
	var token = req.header('x-auth');
	if (!token) {
		return res.status(400).send('no token provided');
	}
	User.findByToken(token).then(user => {
		res.send(user.toJSON());
	})
	.catch(err => {
		return res.status(err.status).send(err.message)
	});
}

const init = (token, socket, connected) => {
	User.findByToken(token).then(user => {
		socket.type = 'user';
		connected.users[user.token] = true;
		session = new Session {}
	}).catch(() => {
		socket.type = 'guest';
		return Guest.findByToken(token).then(guest => {
			if(!guest){
				guest = new Guest({socket})
				return guest.generateAuthToken()
					.then(token => connected.guests[guest.token] = true)
					.catch(() => console.log('Error generating guest token'))
			}
			connected.guests[guest.token] = true;
		})
	})
}

const login = (req, res) => {
	User.findByCredentials(body.email, body.password).then( user => {
		return user.generateAuthToken(body.persist).then(token => {
			return res.header('x-auth', token).send(user.toJSON());
		})
	}).catch(err => res.status(err.status).send(err.message));
}

const newUser = (req, res) => {
	body.displayName=body.email.substring(0, body.email.indexOf('@'));
	let decoded;
	try {
		decoded = jwt.verify(body.token, newUser)
	}
	let user = new User (body);
	user.generateAuthToken()
	.then(token => res.status(200).header('x-auth', token).send(user))
	.catch(e => res.status(400).send({mongoCode: e}));
}

const findUser = (req, res) => {
	
	userList = User.find()
}

const returnUsers = (req, res) => {
	if (!Object.keys(body)[0]){
		return User.find()
		.then(list => res.status(200).send(list))
		.catch(err => res.status(400).send('no users exist'));
	}
	let searchTerm = {};
	if (Object.keys(body)[0] === 'personal') {
		if (Object.keys(body.personal)[0] === 'name'){
			searchTerm = {'personal.name': body.personal.name}
			delete body.personal.name;
		}
		else {
			value = Object.keys(body.personal.address)[0]
			searchTerm = {['personal.address'+value] : body.personal.address[value]};
			delete body.personal.address[value];
		}
	}
	else {
		value = Object.keys(body)[0]
		searchTerm = {[value]: body.value}
		delete body[value]
	}
	return User.find({
		searchTerm
	})
	.then(list => {
		for (let i = 0; i < list.length; i++) {
			for (const key in body) {
				if (key === 'personal'){
					for (const addressKey in body.personal.address){
						if (list[i].personal.address[keyIn] !== body.personal.address[keyIn]){
							list.splice(i, 1);
							i--;
						}
					}
				}
				if (list[i][key] !== body[key]){
					list.splice(i, 1);
					i--;
				}
			}
		}
		if (!list[0]){
			return Promise.reject({status: 400, message: 'No users found that fit search'});
		}
		let retVal = [];
		for (user in list){
			retVal.push(user._id);
		}
		return res.status(200).send(retVal);
	})
	.catch(err => res.status(err.status).send(err.message))
}

const promoteUser = (req, res) => {
	const token = req.header('x-auth');
	//find current user by their token
	Group.find({req.groupId}).then(group => {
		User.findByToken(token).then( user => {
			if (!group.admin.includes(user._id)){
				Promise.reject({status: 401, message: 'Non-admin cannot promote group members.'})
			}
			if (!group.admin.includes(group.users[res.target])){
				group.admin.push()
			}
			group.markModified('admin');
			group.save();
		}
	})
}

const updateClass = (req, res) => {
	const token = req.header('x-auth');
	User.findByToken(token).then(user => {
		if (user.type !== 'admin' && user.type !== 'master') {
			return Promise.reject({status: 401, message: 'invalid privileges to edit user types.'});
		}
		if (targetClass === 'admin' || targetClass === 'master') {
			return Promise.reject({status: 400, message: 'cannot promote users through this method.'});
		}
		User.findOneAndUpdate({_id: target}, {$set: {type: targetClass}}, {new: true}).then(() => res.status(200).send({[targetUser.email]: targetClass}));
	})
}

const logout = (req, res) => {
	// find user, delete auth token in database.
	User.findByToken(req.header('x-auth'))
	.then( user => {
		if(!user){
			Promise.reject({status:400, message: "no user matching that token exists."});
		}
		user.removeToken(req.header('x-auth'))
		.then(() => {
			res.status(200).send();
		}).catch(err => {
			res.status(err.status).send(err.message);
		});
	})
	.catch(err => {
		console.log(err);
		res.status(err.status).send(err.message)
	})
}

const logoutNonPersistent = token => {
	//get user from token
	return User.findByToken(token)
	.then(user => {
		user.removeToken(token, true);
	})
	.catch(err => res.status(err.status).send(err.message))
}

const updateUser = (req, res) => {
	var token = req.header('x-auth');
	return User.findByToken(token)
	.then(user => {
		if (!user) {
			return Promise.reject({status: 401, message: "no such user"});
		}
		//if target selected, go into target alteration;
		if (body.target){
			return User.findOne({_id:body.target})
			.then(target => {
				if(!target){
					Promise.reject({status: 400, message: "no such target"})
				}
				//only master admin may use this method.
				if (user.type !== 'master')
				{
					Promise.reject({status: 401, message: "insufficient privileges"});
				}
				//personal is an object, so overwriting it will delete original values, even if they aren't changed.
				//... use to prevent this.
				delete body.target;
				for (const key in body) {
					if (key === 'address'){
						target.address = {...target.address, ...body.address}
					}
					else{
						target[key] = body[key];
					}
				}
				target.save()
				.then(() => res.status(200).send(target))
				.catch(err => res.status(401).send(err.message));
			})
		}
		//if there is no target, we're altering the user themselves.
		for (const key in body) {
					if (key === 'address'){
						user.address = {...user.address, ...body.address}
					}
					else{
						user[key] = body[key];
					}
		}
		return user.save()
		.then(() => res.status(200).send(user.toJSON()))
		.catch(err => res.status(401).send(err.message))
	})
	.catch(e => {
		if (e.status){
			res.status(e.status).send(e.message);
		}
		else{
			res.status(401).send(e);
		}
	})
}

module.exports.authenticate = {demoteUser, authByToken, login, updateUser, promoteUser, returnUsers, newUser, logout, logoutNonPersistent};