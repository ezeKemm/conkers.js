import { Client, ClientOptions, Collection, Guild } from 'discord.js'
import { Commands } from '../commands'

async function issueMessage(channelId: string) {}

export class DiscordContext {
	public guilds: Collection<string, Guild>

	constructor(
		public client: Client,
		public commandRegistry: Map<string, Commands>,
	) {
		this.guilds = this.client.guilds.cache
		this.guilds.forEach((k, guild) =>
			console.log(`Connected guild : ${guild}, ${k}`),
		)
	}
}

class DiscordClient extends Client {
	constructor(clientOptions: ClientOptions) {
		super(clientOptions)
	}
}
