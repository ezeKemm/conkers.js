import PocketBase, { RecordModel } from 'pocketbase'
import { config } from '../config'

// Naive aid for Typescript type safety
export type ReminderRecord = {
    userId: string,
    channelId: string,
    reminderName: string,
    remindAt: number
}

/**
 * Connect to the Pocketbase database and authenticate as Superuser. 
 * 
 * Pocketbase does not really have a persistent state client-side connection, so this is invoked before every API call.
 * 
 * @warn Can silently fail, throws error
 * 
 * @returns PocketBase client instance
 */
const connectToPb = async (): Promise<PocketBase> => {
    // Spawn a new PocketBase client instance to connect to database
    const pb = new PocketBase(config.PB_URL)
    // Authenticate as Superuser
    // WARN: can throw
    pb.collection('_superusers').authWithPassword(config.SUPERUSER_EMAIL, config.SUPERUSER_PASS)
    return pb
}

/** 
 *  Create a record in the Reminders 'collection' in the database.
 *  @warn Can fail, database can throw
 * 
 *  @param {string} userId ID of the user who set the reminder 
 *  @param {string} channelId ID of the channel where the command was invoked, the reminder will be spent here   
 *  @param {string} reminderName Name of the reminder
 *  @param {number} remindAt When the reminder is set to alert in UNIX timestamp format (in milliseconds) 
 * 
 *  @returns The newly created record object 
 */
export const createReminder = async (
    userId: string, 
    channelId: string,
    reminderName: string, 
    remindAt: number,
): Promise<RecordModel> => {
    // Connect to database
    const pb = await connectToPb()

    // Add new reminder record to collection 
    // WARN: Can throw
    let response = pb.collection('reminders').create({
        userId,
        channelId,
        reminderName,
        remindAt,
    })

    return response
}

/**
 * Retreive a Reminder record from the database by ID
 * @warn Can fail, database can throw
 * 
 * @param id Record ID of Reminder to query
 * @returns Record data for queried Reminder
 */
export const getReminderById = async (id: string) => {
    const pb = await connectToPb()
    return await pb.collection('reminders').getOne(id)
}

/**
 * Get all initialized reminders in the database sorted by earliest reminder (i.e. the reminder expiring the soonest). 
 * Userful for automatically managing the persistence of Reminders on the application in 
 * the case of server/application downtime or interupts to service. 
 *
 * If the application goes offline, the client will retrieve 
 * these records on startup and reschedule the reminders
 * 
 * @returns List of reminders' data
 * 
 */
export const getAllReminders = async (): Promise<RecordModel[]> => {
    const pb = await connectToPb()
    // Should sort list by earliest reminder (the soonest reminder to expire) to latest reminder
    // This is more optimal than sorting by creation date or other criteria to ensure reminders 
    // close to their deadline get scheduled first, regardless of when the reminder was created
    const reminderList = await pb.collection('reminders').getFullList({
        sort: '-remindAt'
    })
    return reminderList
}

/**
 * Delete a record from the Reminders collection.
 * @warn Can fail, database can throw
 * 
 * @param id The reminder record's ID string
 * @returns A boolean indicating the deletion operation's success
 */
export const deleteReminder = async (id: string): Promise<boolean> => {
    const pb = await connectToPb()
    let response = pb.collection('reminders').delete(id) // WARN: can throw
    return response
}

// NOTE: inefficient querying of db, should use batch...
// although PB's batch API looks sketch / underperformant
/**
 * Naive method to insert all Reminders for `/setmeals` at once using a loop and sequential database queries. 
 * Batching would be more performant at scale but since we only ever perform 7 operations, the linear time means this performs fine
 * @warn Can fail, createReminder can fail
 * 
 * @param days Arrary of records to be inserted
 * @returns Array of IDs for all inserted reminder records in order of insertion
 */
export const createMealReminders = async (days: ReminderRecord[]): Promise<string[]> => {
    let responseList: string[] = []
    for (let day of days) {
        let response = await createReminder(day.userId, day.channelId, day.reminderName, day.remindAt) 
        responseList.push(response.id)
    }
    console.log(responseList)
    return responseList
}
