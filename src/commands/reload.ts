import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { REST, Routes } from "discord.js"; 
import { config } from "../config";
import { commands } from ".";

export const data = new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command');

const commandsData = Object.values(commands).map((command) => command.data);
const rest = new REST({version: "10"}).setToken(config.DISCORD_TOKEN);

export async function execute(interaction: CommandInteraction) {
    const guild = interaction.guild!;
    const guildId = guild.id;

    console.log(`Reload command issued from server: ${guild.name}`);

    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
            {
                body: commandsData,
            }
        );
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }

    interaction.reply("Commands reloaded!");
    console.log(`Reload successful`);
}
    