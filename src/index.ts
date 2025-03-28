import { Client } from 'discord.js'
import { config } from './config'
import { commands } from './commands'
import { deployCommands } from './deploy-commands'
import { getAllReminders } from './db/pb'
import { scheduleReminder } from './backend/scheduleReminder'
// import { DiscordContext } from './frontend/Discord'
// import guildConfig from '../guild_config.json'
import {
	syncCommandCache,
	createCommandRegistry,
	addToCommandRegistry,
} from './frontend/guilds'
import {
	addGuild,
	getConfigFile,
	GuildConfig,
	mapConfigs,
	syncConfig,
	writeConfigToFile,
} from './frontend/guild-config'

const client = new Client({
	intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
})

// const mockGuildConfigList: GuildConfig[] = [
// 	{
// 		index: 0,
// 		guild: 'Paradox Gaming',
// 		guildId: '307651899270889482',
// 		commands: ['ping', 'today'],
// 		dev: true,
// 	},
// ]
// const commandList = createCommandRegistry(mockGuildConfigList, commands)
// const chestnut = {
// 	index: 1,
// 	guild: 'Chestnut Cooperative',
// 	guildId: '1281408620826984573',
// 	dev: false,
// 	commands: ['setmeals', 'setreminder', 'today'],
// }
// const guildConfigs: GuildConfig[] = guildConfig.guilds
// const guildCommandRegistry = createCommandRegistry(guildConfigs, commands)
// const confiG = getConfigFile()
// const guildMap = mapConfigs(confiG)
// console.log(confiG, guildMap)

const guildConfig = getConfigFile()
const guildCache = client.guilds.cache
const configMap = syncConfig(guildConfig, guildCache)

const guildCommands = createCommandRegistry(guildConfig.guilds, commands)

client.once('ready', async () => {
	console.log('Conker -> starting up...')

	console.log('Syncing commands...')
	// syncCommandCache()
	console.log('End check...')

	const guilds = client.guilds.cache
	guilds.forEach((guild, guildId) =>
		console.log(`Connected guild : ${guild} -> ${guildId}`),
	)

	// Schedule reminders on 'ready' state, from database (i.e. in the event of a restart or bootup)
	// Also will prune database of expired reminders
	const reminders = await getAllReminders()
	console.log('Cached reminders: ', reminders)
	for (const reminder of reminders) {
		scheduleReminder(client, reminder.id)
	}
})

client.on('guildCreate', async (guild) => {
	const newGuildConfig = addGuild(guildConfig, guild.id, guild.name, false)
	writeConfigToFile(guildConfig)
	addToCommandRegistry(guildCommands, newGuildConfig, commands)

	const commandList = guildCommands.get(guild.id)
	if (!commandList) {
		throw new Error('BIG ERROR -> cannot find the commandList on guildCreate')
	}
	await deployCommands(guild.id, commandList!)

	guild.commands
		.fetch()
		.then((commands) => {
			console.log(`Commands for ${guild.name}:`)
			commands.forEach((cmd) => {
				console.log(`${cmd.name}: ${cmd.options.length} options`)
			})
		})
		.catch(console.error)
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) {
		return
	}
	const { commandName, guildId } = interaction
	const guildCommandList = guildCommands.get(guildId!)
	if (guildCommandList && guildCommandList.get(commandName)) {
		guildCommandList.get(commandName)!.execute(interaction)
	} else {
		console.log('Command execution unsuccessful')
	}
})

client.login(config.TOKEN)
