import { REST, Routes } from 'discord.js'
import { config } from './config'
import { Commands } from './commands'

const rest = new REST({ version: '10' }).setToken(config.TOKEN)

export async function deployCommands(guildId: string, registry: Commands) {
	// DO: better error handling and validation
	const commandsData = Array.from(registry.values()).map(
		(command) => command.data,
	)
	try {
		console.log('Started refreshing application (/) commands.')

		await rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, guildId), {
			body: commandsData,
		})
		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
}
