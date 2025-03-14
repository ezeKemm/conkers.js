import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DEV_GUILD_ID, DEV_DB_URL } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DEV_GUILD_ID || !DEV_DB_URL) {
    throw new Error("Missing environment variables");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DEV_GUILD_ID,
    DEV_DB_URL,
};