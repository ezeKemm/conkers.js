import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});


client.once("ready", async () => {
    console.log("Conker is here");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id})
    guild.commands.fetch().then(commands => {
        console.log(`Commands for ${guild.name}:`)
        commands.forEach(cmd => {
            console.log(`${cmd.name}: ${cmd.options.length} options`)
        })
    }).catch(console.error);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
    }
});

client.login(config.DISCORD_TOKEN);