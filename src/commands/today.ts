import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { today } from "../utils";

export const data = new SlashCommandBuilder()
    .setName("today")
    .setDescription("Returns today's date.");

export async function execute(interaction: CommandInteraction) {

    const day = today(); 
    console.log(day);
    interaction.reply(`Today's date is ${day}`);
}