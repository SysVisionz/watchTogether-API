const validator = require ('validator');
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const {User, Chat} = require('./chat'); 

const FriendSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	}
});

FriendSchema.statics.returnList = function(){
	return Friend.find({_id: {$in: this.friends}})
	.then(friendsElems => {
		const retval = {};
		for (const i in friendsElems){
			const {displayName, name, active} = friendsElems[i]
			const {index, priority} = this.friendsData[i]
			retval[displayName] = {name, active, priority, index};
		}
		return retval;
	}).catch( err => Promise.reject({status: 404, message: 'Friendslist is empty.'}))
})

const between = (val, val1, val2) => {
	const order = val1 > val2 ? [val1, val2] : [val2, val1];
	return val > order[1] && val < order[0];
}

const highestOf = (objectArr, target) => {
	let highest = 0;
	for (const i in objectArr){
		highest = objectArr[i][target] > highest ? objectArr[i][target] : highest;
	}
	return highest;
}

FriendSchema.methods.deleteFriend = function(index){
	this.friends.;
	return this.save();
}

FriendSchema.methods.setPriority = function(friendId, newPriority){
	for (const i in this.friendsData){
		const {priority} = this.friendsData[i];
		if (priority === current) {
			this.friendsData[i].priority = newPriority;
		}
		else if (between(priority, current, newPriority) || priority === newPriority){
			this.friends[i].priority += current > newPriority ? 1 : -1
		}
	}
	this.markModified('friends');
	return this.save()
}

FriendSchema.methods.addFriend = function(id){
	this.friends.push(id);
	this.friendsData
}

const Friend = mongoose.model('Friend', FriendSchema);		

module.exports = {Friend};