module.exports = {
	description: 'Replies with the bot\'s stats',
	category: 'Utils',
	cooldown: 5000,
	run: async function (message) {
		const stats = await this.utils.queryDB('SELECT (SELECT count(*) FROM messages) messages, (SELECT count(*) FROM commands) commands');
		const topCommandStats = await this.utils.queryDB('SELECT command,count(*) FROM commands GROUP BY 1 ORDER BY count(*) DESC LIMIT 1');
		const topSongStats = await this.utils.queryDB('SELECT id,count(*) FROM songs GROUP BY 1 ORDER BY count(*) DESC LIMIT 1');

		const messages = stats.rows[0].messages;
		const commands = stats.rows[0].commands;

		const topCommand = {
			command: topCommandStats.rows[0] && topCommandStats.rows[0].command,
			uses: topCommandStats.rows[0] && topCommandStats.rows[0].count
		};

		const topSong = {
			id: topSongStats.rows[0] && topSongStats.rows[0].id,
			timesPlayed: topSongStats.rows[0] && topSongStats.rows[0].count
		};

		const shardGuilds = await this.client.shard.fetchClientValues('guilds.size');
		const guildCount = shardGuilds.reduce((all, val) => all + val, 0);

		const shardUsers = await this.client.shard.broadcastEval('this.guilds.map(g => g.memberCount).reduce((a, c) => a + c, 0)');
		const userCount = shardUsers.reduce((all, val) => all + val, 0);

		const commitHash = require('child_process').execSync('git rev-parse --short HEAD').toString().trim();
		const modified = !!require('child_process').execSync('git status -s').toString();

		let body = `Listening on ${guildCount} servers with ${userCount} users\n\n`;
		body += `Most used command: **${topCommand.command ? (this.botCfg.prefix + topCommand.command) : 'No commands used'}** (${topCommand.uses || 0} uses)\n`;
		body += `Most played song: ${topSong.id ? `[Click here](https://youtube.com/watch?v=${topSong.id}) (Played ${topSong.timesPlayed} times)` : 'No songs played'}\n\n`;
		body += `Commands used: **${commands}** in total\n`;
		body += `Messages sent: **${messages}** in total\n\n`;
		body += `Node ${process.version}\n`;
		body += `discord.js v${this.api.version}\n`;
		body += `fbot #${commitHash}${modified ? '-mod' : ''}`;

		const embed = new this.api.MessageEmbed();

		embed.setTitle('Bot stats');
		embed.setDescription(body);
		embed.setFooter('fbot.menchez.me');
		embed.setColor(0x3366ff);

		message.channel.send({
			embed
		});
	}
};
