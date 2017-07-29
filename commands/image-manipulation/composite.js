module.exports = {
	description: 'Overlays all images over each other',
	args: '(@user | Attachment | URL)+',
	category: 'Fun',
	aliases: ['merge'],
	cooldown: 5000,
	run: async function (message, args) {
		const images = await this.utils.getImagesFromMessage(message, args);

		if (images.length < 2) return this.commandHandler.invalidArguments(message);

		let result;
		for (let index = 0; index < Math.min(images.length, 20); index++) {
			let image = await this.utils.fetchImage(images[index]);
			if (!image || image instanceof Error) continue;

			if (!result) result = new this.jimp(image.bitmap.width, image.bitmap.height, 0xFFFFFFFF);

			image = await image.opacity(1 / (index + 2));
			result = await result.composite(await image.resize(result.bitmap.width, result.bitmap.height), 0, 0);
		}

		result = await this.utils.getBufferFromJimp(result);

		message.channel.send({
			files: [{
				attachment: result,
				name: 'composite.png'
			}]
		});
	}
};
