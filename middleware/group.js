const _ = require('lodash');
const {User, Group} = require('../models');

const updateInfo = (req, res) => {
	//push data to chat websocket. Push data to user's chat record.
}

const getMembers = (req, res) => {

}

const addMember = (req, res) => {
	//get current projects for this account, as well as if those projects are open, cancelled, awaiting payment, or completed.
}

const demoteMember = (req, res) => {
	//add user with specified email to account, create link for user to create their account if no account exists with that email, record who took action.
}

const kickMember = (req, res) => {
	//add email to account notifications without creating a new account for that email.
}

const promoteMember = (req, res) => {
	//promote member to admin status for group
}

const getGroupHistory = (req, res) => {
	//return users list for that account (emails, the name listed for that account).
}

const  = (user, account) => {
	//retrieve invoices index for account.
}

module.exports.group = {}