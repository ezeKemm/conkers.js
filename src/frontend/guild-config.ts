import path from 'path'
import configFile from '../../guild_config.json'
import { writeFileSync } from 'fs'
import { Collection, Guild } from 'discord.js'

export interface ConfigJSON {
	default_commands: string[]
	guilds: GuildConfig[]
}

export interface GuildConfig {
	index: number
	guild: string
	guildId: string
	dev: boolean
	commands: string[]
}

export function getConfigFile() {
	return configFile as ConfigJSON
}

export function getCommandDefaults(config: ConfigJSON) {
	return config.default_commands
}

export function mapConfigs(config: ConfigJSON) {
	const configs: Collection<string, GuildConfig> = new Collection(
		config.guilds.map((guild) => [guild.guildId, guild]),
	)
	return configs
}

export function addGuild(
	config: ConfigJSON,
	guildID: string,
	guildName: string,
	dev: boolean,
) {
	const guildConfig: GuildConfig = {
		index: config.guilds.length,
		guild: guildName,
		guildId: guildID,
		dev: dev,
		commands: config.default_commands,
	}
	config.guilds.push(guildConfig)
	console.log('New config:\n', config)
	return guildConfig
}

export function deleteGuild(config: ConfigJSON, index: number) {
	config.guilds.splice(index, 1)
	console.log('New config:\n', config)
}

// Async this? use fs/promise?
export function writeConfigToFile(config: ConfigJSON) {
	console.log('Writing new config to guild_config.json...')
	const jsonData = JSON.stringify(config, null, 2)
	const filepath = path.join(path.resolve('./'), 'guild_config.json')
	try {
		writeFileSync(filepath, jsonData)
	} catch (err) {
		console.log(`Write error :: ${err}`)
	}
	console.log('Write successful!')
}

export function syncConfig(
	config: ConfigJSON,
	cache: Collection<string, Guild>,
) {
	const configMap = mapConfigs(config)
	const guildSetDiff = configMap.difference(cache)
	if (guildSetDiff.size > 0) {
		return configMap
	}
	console.log(`(${guildSetDiff.size}) unsynch'd guilds found -> updating...`)
	guildSetDiff.forEach((guild, id) => {
		if (configMap.get(id)) {
			console.log(`${id} not found in cache -> deleting from config...`)
			const index = configMap.get(id)!.index
			deleteGuild(config, index)
		} else {
			console.log(`${id} not found in config -> adding to config...`)
			addGuild(config, id, (guild as Guild).name, false)
		}
	})
	console.log('Writing to config...')
	writeConfigToFile(config)
	return configMap
}
