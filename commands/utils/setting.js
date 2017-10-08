const parseBoolean = (value) => {
	return ['1', 'true', 'yes', 'y', 'on', '+'].includes(value.toLowerCase());
};

const parseMention = (value) => {
	return value.replace(/[^\d]/g, '');
};

const modifyableSettings = {
	'joinMessage': String,
	'leaveMessage': String,
	'messageChannel': parseMention,
	'disableAutoreact': parseBoolean,
	'levelUpMessage': String
};

module.exports = {
	description: 'Shows/sets a server specific setting',
	category: 'Utils',
	args: '(setting) | (setting) (*value) | (setting) *clear',
	cooldown: 1000,
	run: async function (message, args) {
		if (!message.guild) return message.channel.send('Sorry, but this command cannot be executed via DM!');
		if (args.length === 0) return this.commandHandler.invalidArguments(message);

		const setting = args.shift();

		if (!modifyableSettings[setting]) return message.channel.send(`The setting \`${setting}\` does not exist\nAvailable settings:\n\n\`${Object.keys(modifyableSettings).join('` - `')}\``);

		if (args.length === 0) {

			const res = await this.utils.queryDB('SELECT value FROM settings WHERE setting = $1 AND server = $2', [setting, message.guild.id]);

			if (res.rowCount === 0) return message.channel.send(`Setting \`${setting}\` is not set!`);
			message.channel.send(`Setting \`${setting}\` is currently set to \`${res.rows[0].value}\``);

		} else {

			if (!message.member.hasPermission('MANAGE_GUILD') && !this.utils.isAdmin(message.author.id)) return message.channel.send(':x: Only guild administrators can change settings');

			if (args.length >= 1) {

				const value = modifyableSettings[setting](args.join(' '));

				if (['clear', 'delete'].includes(value)) {

					await this.utils.queryDB('DELETE FROM settings WHERE server = $1 AND setting = $2', [message.guild.id, setting]);
					message.channel.send(`Setting \`${setting}\` has been cleared`);

				} else {

					await this.utils.queryDB('DELETE FROM settings WHERE server = $1 AND setting = $2', [message.guild.id, setting]);
					await this.utils.queryDB('INSERT INTO settings VALUES ($1, $2, $3)', [message.guild.id, setting, value]);
					message.channel.send(`Setting \`${setting}\` has been set to \`${value}\``);

				}

			} else this.commandHandler.invalidArguments(message);

		}
	}
};
