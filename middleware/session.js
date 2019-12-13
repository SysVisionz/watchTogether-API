import urlMetadata from 'url-metadata';
import {Session} from '../models';


const timesMatch = (req, res) => {
	
}

const getMeta = link => {
	return urlMetadata(link).then(data => {
		const {image=data["og:image"], title=data["og:title"],  description=data["og:description"]} = data;
		return {image, title, description};
	}
}

module.exports.session = {}