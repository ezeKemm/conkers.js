import { GuildConfig } from './guild-config'
import { ApplicationCommand, Collection, Guild as DGuild } from 'discord.js'
import { type Commands } from '../commands'
import { deployCommands } from '../deploy-commands'

// export type CommandData = (SlashCommandBuilder | SlashCommandOptionsOnlyBuilder)

export class Guild {
	constructor(
		public Id: string,
		public commands: string[],
	) {}
}

/**
 * Map the list of commands available to a guild for each guild.
 * Commands are enabled/disabled via the GuildConfig
 *
 * @param guild_confs An array of each guild's GuildConfig
 * @returns A Map between each guild (by ID) to their list of available commands
 */
export function createCommandRegistry(
	guild_confs: GuildConfig[],
	commands: Commands,
) {
	const commandRegistry: Collection<string, Commands> = new Collection()
	guild_confs.forEach((config) => {
		const guildCommands: Commands = new Collection(
			Array.from(commands.entries()).filter(([key]) =>
				config.commands!.includes(key),
			),
		)
		commandRegistry.set(config.guildId, guildCommands)
	})
	return commandRegistry
}

export function addToCommandRegistry(
	registry: Collection<string, Commands>,
	config: GuildConfig,
	commands: Commands,
) {
	const newGuildCommands: Commands = new Collection(
		Array.from(commands.entries()).filter(([key]) =>
			config.commands!.includes(key),
		),
	)
	registry.set(config.guildId, newGuildCommands)
}

export async function syncCommandCache(
	guild: DGuild,
	configCommands: string[],
	cacheCommands: Collection<string, ApplicationCommand>,
	mainCommandsList: Collection<string, Commands>,
	// Should be able to use the guildsCommandsRegistry here instead of all this hullabaloo
) {
	console.log(
		`-> Config: ${configCommands.length}, Cache: ${cacheCommands.size}`,
	)
	if (configCommands.length != cacheCommands.size) {
		if (configCommands.length < cacheCommands.size) {
			console.log('\t-> Resetting cache...')
			clearCommandCache(guild)
		}
		console.log('\t-> Updating cache...')
		const guildCommands = mainCommandsList.get(guild.id)!
		await deployCommands(guild.id, guildCommands)
	}
}

export function clearCommandCache(guild: DGuild) {
	guild.commands.cache.clear()
}
