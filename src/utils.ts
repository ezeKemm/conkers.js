import { Channel, Client } from "discord.js";
import { DateTime } from "luxon";

// TODO: standardize to Luxon or JS Date (check up on Temporal)
/**
 *  Utility function for getting the current timestamp in the local timezone via a Luxon DateTime object 
 * 
 *  @returns Luxon DateTime object for the current time
 */

export function getNow(): DateTime<true>  {
    return DateTime.now()
}

/**
 *  Utility function for getting current date in human-readable format.
 * 
 *  @returns Current timestamp in human-readable ISO string format (XXX. MMM, DD, YYYY).
 */
export function today(): string {
    return DateTime.now().toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
}

/**
 *  Get instance of a Discord channel from the Channel's ID. 
 *  Will return undefined in the event Discord fails to retreive the cached channel
 * 
 *  @param client An instance of the Discord Client object 
 *  @param channelId The ID of the target channel
 *  @returns  A Discord Channel instance
 */
export function getChannel(client: Client, channelId: string): Channel | undefined {
    return client.channels.cache.get(channelId);
}

/**
 *  Get the i-th day from today
 * 
 *  @param i The i-th day from Date.now(); corresponds to an index value from the Iterable which invoked the function
 *  @returns A native JS Date object i-days away from today (Date.now)
 *  
 *  @remark Only the Date component is modified, the timestamp must be configured separately
 */
export function ithDate(i: number): Date {
    const today = new Date(Date.now())  // Get today's date (and timestamp)
    let returnDate = new Date()         // Date to return
    returnDate.setDate(today.getDate() + i)  // Set returnDate to i days from today
    return returnDate
}
