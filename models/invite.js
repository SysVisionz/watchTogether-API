import User from './user';
import Group from './group';
const mongoose = require('mongoose');

const funcSwitch = (val, arr) => {
	for (const i in arr){
		if (val === arr[i][0]){
			return arr[i][1]
		}
		if (typeof arr[i][0] === 'object'){
			const possible = arr[i][0]
			if (!possible.indexOf){
				throw "TypeError: The value match must be either a single key or an array of keys."
			}
			else if (arr[i][0].includes(val)){
				return arr[i][1];
			}
		}
	}
}

const InviteSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId
	},
	target: {
		type: mongoose.Schema.Types.ObjectId
	}
	group: {
		type: mongoose.Schema.Types.ObjectId
	},
	session: {
		type: mongoose.Schema.Types.ObjectId
	},
	privileges: {
		type: Object
	},
	typeOf: {
		type: String
	}
});

InviteSchema.statics.getInvitations = token => {
	return User.findByToken(token).then(user => {

	})
}

InviteSchema.statics.invitation = (user, target, type, privileges) => {
	return funcSwitch(type, [
		['session', () => ]
		['group', () => ]
		['friend', () => ]
	])
}

InviteSchema.methods.getUserPair = () => {
	return User.findOne({_id: this.user}).then(invited => {
		return User.findOne({_id: this.target}).then(invitee => {
			return {invited, invitee};
		})
	})
}

InviteSchema.methods.accept = (token, didAccept) => {
	if (!didAccept){
		return this.remove();
	}
	else {
		return funcSwitch(this.typeOf, [
				'session',
				pair => pair().then(pair => {
					const session = pair.invited.session
					return pair.invitee.joinSession(session)
				})],
				[
				'group',
				pair => pair().then
				]
			)(this.getUserPair).then(() => this.remove())
		}
	}
}

InviteSchema.methods.returnSession = user => {
	if (!user){
		return Promise.reject({status: 404, message: "User no longer exists."})
	}
}

InviteSchema.pre('save', () => {
	if (this.isNew){
		this.session = funcSwitch(this.typeOf, ['session', () => User.findOne({id: this.user}).lean()])
	}
})


const Invite = mongoose.model('Invite', InviteSchema);		

module.exports = {Invite};