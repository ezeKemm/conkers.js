import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getChannel, getNow, ithDate, today } from "../utils";
import { createMealReminders, ReminderRecord } from "../db/pb";
import { scheduleReminder } from "../backend/scheduleReminder";

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
    const data = interaction.options.data;

    // Debugging 
    console.log(
        `[${getNow()}] :: Command '/setmeals' invoked in \ 
            ${getChannel(interaction.client, interaction.channelId)} \ 
            by ${interaction.member?.toString()}\n`
        );

    // Template string for bot response
    let schedule: string = `Here is the meal schedule for the week starting on ${today()}!\n\n`;

    // Parse data to create database records and fill the template string out
    let reminderRecords: ReminderRecord[] = data.map((day, i) => {
        schedule += `${day.name}: ${day.user ? day.user : day.role}\n`;
        let time = ithDate(i+1)
        time.setHours(17, 0, 0)
        return {
            userId: day.user ? day.user.id : day.role!.id,
            channelId: interaction.channelId,
            reminderName: day.user ? `<@${day.user.id}>` : `<@&${day.role!.id}>`,
            remindAt: time.getTime(), 
        }
    })

    console.log('user list: ', reminderRecords)

    // NOTE: Discord requires a reply within 3 seconds,
    // Usually operations like a database request would require use of deferReply
    // But this request is quick enough to avoid that
    const recordResponse = await createMealReminders(reminderRecords)

    schedule += `Reminders have been set!\n`

    // Publishes the meal schedule to the Discord
    const replyResponse = await interaction.reply({ content: schedule, withResponse: true });
    // Pins current schedule to channel for easier reference using withResponse property
    // NOTE: this method wouldn't work if deferReply was necessary 
    replyResponse.resource?.message?.pin();

    // TODO: unpinning is manual until a more automated way is found,
    // bot reminds you to manually unpin the previous schedule
    await interaction.followUp({ content: 'Manually remove my last pin!', flags: MessageFlags.Ephemeral })

    for (let [i, _] of reminderRecords.entries()) {
        await scheduleReminder(
            interaction.client, 
            recordResponse[i]
        )

       // let delay = record.remindAt - Date.now()
        // let recordId = recordResponse[i]
        // console.log('Delay: ', delay, 'Record Id: ', recordId)

        // setTimeout(async () => {
        //     try {
        //         // Query the database using the saved recordIds
        //         // This should allow the reminder to be "dynamically loaded"
        //         // i.e., in the event a trade occurs on the meal schedule, 
        //         // so long as this change is recorded in the database, the reminder
        //         // will have access to the updated record and remind the correct person
        //         let queryResult = await getReminderById(recordId)
        //         let name = queryResult.reminderName
        //         // let user = queryResult.userId
        //         let time = queryResult.remindAt

        //         // Type declaration casts to subtype `TextChannel` for method `send()`
        //         let channel = interaction.client.channels.cache.get(interaction.channelId) as TextChannel
        //         await channel.send(`Reminder for <t:${Math.floor(time/1000)}:f> : ${name} is scheduled to cook today, ${today()}!`)
        //         let deleteSuccessful = await deleteReminder(recordId)
        //         if (deleteSuccessful) {
        //             console.log(`Reminder record ${recordId} successfully deleted`)
        //         } else {
        //             console.log(`Failed to delete Reminder record ${recordId}`)
        //         }
        //     }
        //     catch (error) {
        //         console.log(error)
        //     }
        // }, delay)
    }
};