const validator = require ('validator');
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {hashTag} = require ('../db/dataConfig')

const HistorySchema = new mongoose.Schema({
	typeOf: {
		type: String,
		required: true
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	}
	movie: [
		{
			title: {
				type: String
			},
			host: {
				type: String
			},
			link: {
				type: String
			},
			id: {
				type: String
			}
		}
	],
	show: [
		{
			title: {
				type: String
			},
			episode: {
				type: String
			},
			show: {
				type: String
			},
			season: {
				type: String
			},
			host: {
				type: String
			},
			link: {
				type: String
			},
			id: {
				type: String
			}
		}
	],
	video: [
		{
			title: {
				type: String
			},
			host: {
				type: String
			},
			link: {
				type: String
			},
			id: {
				type: String
			}
		}
	],
	audio: [
		{
			title: {
				type: String
			},
			host: {
				type: String
			},
			link: {
				type: String
			},
			id: {
				type: String
			}
		}
	],
});

HistorySchema.methods.add = function (type, values) {
	const history = this;
	history[type].push(values);
}

HistorySchema.methods.remove = function (type, index) {
	const history = this;
	this[type].splice(index);
	history.markModified(type);
	return history.save();
}

HistorySchema.methods.get = function () {
	const history = this;
	const {movie, show, video, audio} = history;
	return {movie, show, video, audio};
}

const History = mongoose.model('History', HistorySchema);

module.exports = {History};