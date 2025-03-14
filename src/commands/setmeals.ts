import { CommandInteraction, CommandInteractionOption, MessageFlags, SlashCommandBuilder } from "discord.js";
import { today } from "../datefuckery";

export const data = new SlashCommandBuilder()
    .setName("setmeals")
    .setDescription("Set meal schedule for the week")
    .addMentionableOption(option => 
        option.setName("mon")
            .setDescription("The member to cook Monday")
            .setRequired(true)
    )
    .addMentionableOption(option => 
        option.setName("tues")
            .setDescription("The member to cook Tuesday")
            .setRequired(true)
    )
    .addMentionableOption(option => 
        option.setName("wed")
            .setDescription("The member to cook Wednesday")
            .setRequired(true)
    )
    .addMentionableOption(option => 
        option.setName("thur")
            .setDescription("The member to cook Thursday")
            .setRequired(true)
    )
    .addMentionableOption(option => 
        option.setName("fri")
            .setDescription("The member to cook Friday")
            .setRequired(true)
    )
    .addMentionableOption(option => 
        option.setName("sat")
            .setDescription("The member to cook Saturday")
            .setRequired(true)
    )
    .addMentionableOption(option => 
        option.setName("sun")
            .setDescription("The member to cook Sunday")
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const options = interaction.options.data;
    const start_date: string = today();
    console.log("Printing schedule...\n");
    let schedule: string = `Here is the meal schedule for the week starting on ${start_date}!\n\n`;
    options.forEach((day) => {
        schedule += `${day.name}: ${day.user ? day.user : day.role}\n`;
        console.log(`${day.name}: ${day.user ? day.user : day.role}`);
    });
    await interaction.reply({ content: schedule });
};