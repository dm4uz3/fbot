module.exports = {
	description: 'Overlays the given image onto the God reverse image search result',
	args: '(@user | Attachment | URL)',
	category: 'Fun',
	cooldown: 5000,
	run: async function (message, args) {
		const images = await this.utils.getImagesFromMessage(message, args);

		if (images.length === 0) return this.commandHandler.invalidArguments(message);

		const image = await this.utils.fetchFromAPI('god', {
			images
		});

		message.channel.send({
			files: [{
				attachment: image,
				name: 'god.png'
			}]
		});
	}
};
