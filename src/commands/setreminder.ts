import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { createReminder } from "../db/pb";
import { scheduleReminder } from "../backend/scheduleReminder";

/** 
 *  A slash command to create an individual reminder in Discord
 *  
 *  Internally, Reminders use setTimeout to schedule themselves and the reminder logic is nested within the setTimeout callback 
 *  Reminders are configued according to data from the `reminders` database table (aka PocketBase's `collection`) from within the callback
 *  This means the database is the Source of Truth for reminders, in the event a reminder does not exist on the database,
 *  then the program will treat the reminder as non-existent and will not execute the reminder.
 * 
 *  When this command is invoked, a database record for the newly created Reminder will be inserted and the Reminder
 *  will be scheduled by the bot using setTimeout from within the command's execute() function via scheduleReminder().
 *  
 *  NOTE: setTimeout is not persistent; in other words, reminders will not execute in the event the Discord bot goes offline 
 *  after scheduling the reminder. To remedy this, the database handles persistence. On startup, the bot will query the database 
 *  for all stored reminders and will 'reschedule' them in order of earliest to latest reminders. 
 *  This should prevent any Reminders from 'slipping through a crack' in the event of a server error but only 
 *  in the event the server downtime is not long enough for the reminder to expire. 
 *  
 *  @param name The name of the reminder 
 *  @param when The date the reminder is set to (not including time)
 *  @param hours Sets the hour of the reminder timestamp
 *  @param minutes Sets the minute of the reminder timestamp
 *  @param seconds Sets the second of the reminder timestamp
 * 
 *  @returns Nothing returned
 *  @throws No errors thrown
 */

export const data = new SlashCommandBuilder()
    .setName("setreminder")
    .setDescription("Reminds user at set time")
    .addStringOption(option => option
        .setName('name')
        .setDescription('Name of the reminder')
        .setRequired(true))
    .addStringOption(option => option
        .setName('when')
        .setDescription('When to remind (day only)')
        .setRequired(true))
    .addStringOption(option => option
        .setName('hours')
        .setDescription('Set hour'))
    .addStringOption(option => option
        .setName('minutes')
        .setDescription('Set minute'))
    .addStringOption(option => option
        .setName('seconds')
        .setDescription('Set seconds'))

export async function execute(_interaction: CommandInteraction) {
    // Type declaration to get access to sub-type methods
    const interaction = _interaction as ChatInputCommandInteraction

    const userId = interaction.user.id
    const name: string = interaction.options.getString('name')!
    const channelId = interaction.channelId

    const when: string = interaction.options.getString('when')!
    const hour = interaction.options.getString('hours')
    const minute = interaction.options.getString('minutes')
    const second = interaction.options.getString('seconds')

    let iso_string: string = (hour && minute && second) ? when + `T${hour}:${minute}:${second}.000-04:00` : when
    console.log('iso string: ', iso_string)
    
    const remindAt = new Date(iso_string).getTime()
    console.log('values: \n', userId, name, remindAt)

    await interaction.deferReply();
    let response = await createReminder(userId, channelId, name, remindAt)
    if (response.status) {
        return await interaction.editReply(`Error! Reminder could not be created.`)
    }
    console.log('response: ', response)
    await interaction.editReply(`Success! Reminder set :: \`${name}\` for <@${userId}> at <t:${Math.floor(remindAt / 1000)}:f>`)

    await scheduleReminder(interaction.client, response.id)
}