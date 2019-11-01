const _ = require('lodash');
const {Project, User, Contact} = require('../models');


const receiveContact = (req, res) => {
	var token = req.header('x-auth');
	let body = _.pick(req.body, ['type', 'projectId', 'name', 'email', 'message', 'budget', 'business', 'address']);
	body.timeStamp = Date.now();
	const contact = new Contact(body);
	return contact.save().then(() => {
		User.findByToken(token).then(user => {
			Project.findOne({_id: body.projectId}).lean().then(project => {
				newVersion = new Project({...project, ...body, previousVersion: project._id});
				newVersion.save();
				project.nextVersion = newVersion._id;
				project.save();
				res.send('Contact Sent!')
			})
		}).catch(err => {
			res.send('Contact Sent!')
		})
	}).catch(err => {
		res.status(400).send(err)
	});
}

const newProject = (details) => {
	var token = req.header('x-auth');
	User.findByToken(token).then(user => {
		if (!user || (user.type !== 'master' && user.type !== 'admin')) {
			return Promise.reject({status: 401, message: 'Insufficient privileges to post project'});
		}
		body.createdOn = new Date;
		body._creator = user;
		const project = new Project(body);
		project.save()
		.then(() => {
			res.status(200).send();
		}).catch(e => {
			res.status(400).send(e);
		});
	}).catch(e => res.status(e.status).send(e.message));
}

const editProject = (token, body) => {
	User.findByToken(token)
	.then(user => {
		if (!user || (user.type !== 'master' && user.type !== 'admin')){
			Promise.reject({status: 401, message: 'Insufficient privileges to edit project.'})
		}
		Project.findOne({_id: body._id})
		.then(project => {
			project.content = body.content || project.content,
			project.title  = body.title || project.title,
			project.description = body.description || project.description;
			return project.save().then(editedProject => res.status(200).send(editedProject))
		})
	})
	.catch(err => res.status(err.status).send({message: err.message}));
}

const getProjectList = (req, res) => {
	const body = _.pick(req.body, ['searchStartDate', 'searchEndDate', 'whoFor']);
	if (!body[0]){
		return Project.find().then(ret => {
			let retVal = []
			for (item of ret){
				retVal.push({_id: item._id, title: item.title, description: item.description})
			}
			return res.status(200).send(retVal);
		})
	}
	const titleSearch = body.searchString;
	const contentSearch = body.inContent ? body.searchString : undefined;
	return Project.find()
	.where('start').gt(body.searchStartStartDate).lt(body.searchStartEndDate)
	.where('end').gt(body.searchEndEndDate).lt(body.searchEndEndDate)
	.then(ret => {
		let retVal = []
		for (item of ret){
			const {_id, whoFor, title, start, timeStamp} = item
			retVal.push({_id, whoFor, title, start, timeStamp})
		}
		return res.status(200).send(retVal);
	});
}

const acceptProject = (req, res) => {
	const body = _.pick(req.body, ['_id', 'startDate']);
	return Project.findOne({_id}).then( projectFound => {
		if (!projectFound){
			return Promise.reject({status: 400, message: "No such Project"});
		}
		return User.findByToken(req.header('x-auth')).then(userFound => {
			if (!userFound){
				return Promise.reject({status: 401, message: "Invalid user token."});
			}
			if ((projectFound.type === 'tutor' && userFound.type === 'admin') || userFound.type === 'master' ){
				const date = new Date;
				projectFound.accepted = {by: userFound, on: date}
				if (projectFound.type === 'tutor'){
					Tutor.findOne({user: projectFound.user, whoFor: projectFound.whoFor}).then( tutor => {
						tutor.user = userFound._id;
						tutor.skills = projectFound.skills;
						tutor.active = true;
						tutor.startDate = body.startDate;
						tutor.whoFor = projectFound.whoFor;
						return res.status(200).send();
					})
					.catch( err => res.status(err.status).send({message: err.message}));
				}
				else {
					return Promise.reject({status: 401, message: "Insufficient privileges."})
				}
			}
		}).catch( err => Promise.reject(err));
	}).catch( err => res.status(err.status).send({message: err.message}));
}

const getProject = (req, res) => {
	const _id = req.header('_id');
	const token = req.header('x-auth');
	Project.findOne({_id}).lean().then( project => {
		if (!projectFound) {
			return Promise.reject({status: 400, message: "No such Project"})
		}
		User.findByToken(token).then(userFound => {
			if (!project.user._id === user && !project.users[user] && user.type !== 'master'){
				return Promise.reject({status: 401, message: "You do not have privileges to view this project."});
			}
			res.status(200).send(JSON.stringify(project));
		})
		.catch( err => Promise.reject(err) )
	}).catch( err => res.status(err.status).send(JSON.stringify({message: err.message})) );
}

const getAll = (req, res) => {
	Contact.find().lean().then(contacts => {
		res.status(200).send(JSON.stringify(contacts));
	}).catch(err => res.send(err));
}

const getOne = (req, res) => {
	Contact.findOne({_id}).then( contact => {
		if (!contact) {
			return Promise.reject({status: 404, message: "No such contact found."});
		}
		return res.send(contact.toJSON());
	})
	.catch( err => res.status(err.status).send({message: err.message}));
}

module.exports.contact = {receiveContact, getProjectList, getProject, acceptProject, editProject, newProject, getAll, getOne}