import { Client, TextChannel } from "discord.js";
import { deleteReminder, getReminderById } from "./db/pb";
import { today } from "./utils";

// An async helper function to 'spawn' (schedule) a reminder 
// by scheduling a process Timeout until the allotted time
// and then issuing the reminder message via Discord 
// before finally cleaning up the database records 

/**
 * Schedules a reminder on the Discord application using Node's setTimeout().  
 * At the given time, issues a reminder to the target channel.
 * 
 * @param client Discord client instance
 * @param remindAt UNIX Timestamp (in milliseconds) of when Reminder is set to announce
 * @param recordId ID of the corresponding Reminder record in the database
 * @returns 
 */
export async function scheduleReminder(
    client: Client, 
    recordId: string,
) {
    console.log('In scheduleReminder.ts...')
    // Query the database using the recordId
    // This should allow the reminder to be "dynamically loaded"
    // i.e., in the event a record is updated 
    // (ex. a trade occurs on the meal schedule), 
    // so long as this change is recorded in the database, the reminder
    // will have access to the updated record and remind the correct person
    let queryResult = await getReminderById(recordId)

    // Two Error cases we need to handle:

    // 1) The record does not exist, the source of truth is the database...
    // if the record is gone, the reminder no longer exists and this task is pointless so do nothing

    // For now, just throw an error for this
    if (queryResult.status) throw new Error(`scheduleReminder :: Record ${recordId} DNE :: Status ${queryResult.status}`)

    let remindAt = queryResult.remindAt    // Fetch remindAt from query
    let delay = remindAt - Date.now()     // Calculate duration between now and the scheduled time (in ms)

    // 2) The reminder has expired, if the record still exists but the time has passed 
    // (the only time I think this condition can be fulfilled)
    // the record should be removed without a reminder

    // If reminder expired, delete record and do nothing else
    if (delay <= 0) {
        let deleteSuccessful = await deleteReminder(recordId)
        // Shoddy error handling
        if (deleteSuccessful) {
            console.log(`Reminder record ${recordId} successfully deleted`)
        } else {
            console.log(`Failed to delete Reminder record ${recordId}`)
        }
        return // we're done here 
    } 

    // Debugging
    console.log('Delay: ', delay, 'Record Id: ', recordId)

    // A reminder is scheduled by simply timing out the process for the given duration
    // afterwhich, the reminder is sent and the record updated (deleted)
    setTimeout(async () => {
        // Our ever be-hated try-catch
        try {
            let name = queryResult.reminderName
            let time = queryResult.remindAt
            let channelId = queryResult.channelId
            let user = queryResult.userId

            // Type declaration casts `Channel` to subtype `TextChannel` for method `send()`
            let channel = client.channels.cache.get(channelId) as TextChannel
            // TODO: this template string cannot be changed (afaict) and so this function is not 'generalizable' yet 
            let msg_string = `Reminder! \`${name}\` for <@${user}> at <t:${Math.floor(remindAt / 1000)}:f>`
            // let msg_string =`Reminder for <t:${Math.floor(time/1000)}:f> : ${name} is scheduled to cook today, ${today()}!`
            await channel.send(msg_string)

            // After reminder is sent, delete the record from the database
            let deleteSuccessful = await deleteReminder(recordId)
            // Shoddy error handling, deja vu (or is it?)
            if (deleteSuccessful) {
                console.log(`Reminder record ${recordId} successfully deleted`)
            } else {
                console.log(`Failed to delete Reminder record ${recordId}`)
            }
        }
        catch (error) {
            console.log(error)
        }
        // Currently no reason to run clean-up of Timeouts (clearTimeout()) since a timeout only cancels if the 
        // client goes offline and this seems to clear the cache on Node's end
    }, delay)
    console.log('End scheduleReminder...')
}