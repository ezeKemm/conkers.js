import { REST, Routes } from "discord.js"; 
import { config } from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({version: "10"}).setToken(config.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commandsData.length} application (/) commands.`);
        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID_DEV!),
            {
                body: commandsData,
            }
        );
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();