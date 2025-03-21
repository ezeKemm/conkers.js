import dotenv from "dotenv";

// Load NODE_ENV from .env into process.env
dotenv.config();

// Getting application environment state
const { NODE_ENV } = process.env;
if (!NODE_ENV)  throw new Error("Missing environment variable : NODE_ENV :: Required to deploy bot")
// TODO remove or polish
console.log(NODE_ENV === 'prod' ? "In production environment" : "In development environment");

// Load corresponding .env file into process.env
const envPath = process.env.NODE_ENV === 'prod' ? `.env` : `.env.dev`
dotenv.config({ path: envPath });

// Get environment variables
const { 
    TOKEN, 
    CLIENT_ID, 
    GUILD_ID_DEV, 
    PB_URL,
    SUPERUSER_EMAIL, 
    SUPERUSER_PASS 
} = process.env;

if (!TOKEN) {
    throw new Error("Missing auth token : TOKEN :: Cannot authenticate bot")
}
if (!CLIENT_ID) {
    throw new Error("Missing client ID : CLIENT_ID :: Cannot connect to bot")
}
if (!NODE_ENV && !GUILD_ID_DEV) {
    throw new Error("Missing development guild ID : GUILD_ID_DEV :: Cannot connect to guild for development")
}
if (!PB_URL) {
    throw new Error("Missing PocketBase database URL.")
}
if (!SUPERUSER_EMAIL || !SUPERUSER_PASS) {
    throw new Error("Missing database superuser credentials.")
}

export const config = {
    TOKEN,
    CLIENT_ID,
    GUILD_ID_DEV,
    PB_URL,
    SUPERUSER_EMAIL,
    SUPERUSER_PASS,
};