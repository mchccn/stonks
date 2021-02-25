import AeroClient from "@aeroware/aeroclient";
import { config as dotenv } from "dotenv";
import connect from "./database/connect";
import ClientManager from "./lib/ClientManager";

dotenv();

(async () => {
    await connect();

    const keys = Object.keys(process.env)
        .filter((k) => k.startsWith("API_KEY"))
        .map((k) => process.env[k] as string);

    const manager = new ClientManager(keys);

    const client = new AeroClient({
        token: process.env.TOKEN,
        prefix: ".",
        logging: true,
        commandsPath: "commands",
    });
})();
