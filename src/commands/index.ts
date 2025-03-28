import { Collection, CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import * as ping from "./ping";
import * as setmeals from "./setmeals";
import * as today from "./today";
import * as setreminder from './setreminder'

export const commands: Collection<string, Command> = new Collection([
    ['ping', {
        data: ping.data,
        execute: ping.execute
    }],
    ['setmeals', {
        data: setmeals.data,
        execute: setmeals.execute
    }],
    ['today', {
        data: today.data,
        execute: today.execute
    }],
    ['setreminder', {
        data: setreminder.data,
        execute: setreminder.execute
    }],
])

interface Command { 
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder, 
    execute: (interaction: CommandInteraction) => 
        Promise<void>
}

export type Commands = Collection<string, Command>