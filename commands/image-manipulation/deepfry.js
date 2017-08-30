module.exports = {
	description: 'Deepfries the image',
	args: '(@user | Attachment | URL) [amount]',
	category: 'Fun',
	aliases: ['df'],
	cooldown: 5000,
	run: async function (message, args) {
		const images = await this.utils.getImagesFromMessage(message, args);
		if (images.length === 0) return this.commandHandler.invalidArguments(message);

		let amount = this.utils.isImageArg(message, args[0]) ? args[1] : args[0];
		amount = Math.max(1, Math.min(100, parseInt(amount) || 10));

		const image = await this.utils.fetchFromAPI('deepfry', {
			images,
			args: {
				amount: amount / 100
			}
		});

		message.channel.send(`\`Amount: ${amount}\``, {
			files: [{
				attachment: image,
				name: 'deepfry.jpg'
			}]
		});
	}
};
