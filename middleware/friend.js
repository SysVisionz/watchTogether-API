const _ = require('lodash');
const {User} = require('../models');


const addFriend = (req, res) => {
	token = req.header('x-auth');
	return User.findByToken(token).then(user => {
		if (!user){
			return Promise.reject({status: 403, message: 'You must be a logged in user to add friends.'});
		}
		return User.find({username: req.username}).then(friend => {
			if (!friend){
				return Promise.reject({status: 401, message: 'Sorry, no user found with that username.'});
			}
		})
	})
}

const acceptFriend = (req, res) => {
	token = req.header('x-auth');
	return User.findByToken(token).then(user => {
		if (!user){
			return Promise.reject({status: 403, message: 'You must be a logged in user to add friends.'});
		}
		return User.find({req.username}).then( friend => {
			if (!friend){
				return Promise.reject({status: 404, message: 'Error, no user found with that username.'});
			}
			friend.friends.push(user._id)
			friend.markModified('friends');
			return friend.save().then({
				user.friends.push(friend._id);
				user.markModified('friends');
				return user.save().then({
					friend.notify('newFriend', user.username)
					return res.send('Friend added successfully!');
				})
				.catch(err => Promise.reject({status: err.status, message: err.message}))
			})
			.catch(err => Promise.reject({status: err.status, message: err.message}))
		})
		.catch(err => Promise.reject({status: err.status, message: err.message}))
	})
	.catch(err => res.status(err.status).send(err.message))
}

const checkFriendList = friends => {
	if(!friends[0]){
		return Promise.reject({status: 404, message: 'Friendslist is empty.'})
	}
	return User.findById(friends[0]._id, friend => {
		return friends[1] ? [friend.status, ...checkFriendList(friends.slice(1))] : [friend.status];
	})
}

const friendStatus = (req, res) => {
	token = req.header('x-auth');
	return User.findByToken(token).then(user => {
		return res.send(JSON.parse(checkFriendList(user.friends)));
	})
}

module.exports.contact = {receiveContact, getProjectList, getProject, acceptProject, editProject, newProject, getAll, getOne}