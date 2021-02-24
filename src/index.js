/* Require is stoopid because it doesnt have types. */
// const AeroClient = require("@aeroware/aeroclient");
const ClientManager = require("./lib/ClientManager");

require("dotenv").config();

(async () => {
    const AeroClient = (await import("@aeroware/aeroclient")).default

    const keys = Object.keys(process.env)
        .filter((k) => k.startsWith("API_KEY"))
        .map((k) => process.env[k]);

    const manager = new ClientManager(keys);

    const client = new AeroClient({
        token: process.env.TOKEN,
        prefix: ".",
        logging: true,
        commandsPath: "commands",
    });

    
})();
