import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { getAllReminders } from "./db/pb";
import { scheduleReminder } from "./backend/scheduleReminder";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});


client.once("ready", async () => {
    console.log("Conker is here");

    // Schedule reminders on 'ready' state from database (i.e. in the event of a restart or bootup)
    // Also will prune database of expired reminders
    const reminders = await getAllReminders()
    console.log('Cached reminders: ', reminders)
    for (const reminder of reminders) {
        scheduleReminder(client, reminder.id)
    }
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

client.login(config.TOKEN);