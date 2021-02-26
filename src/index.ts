import AeroClient, { Arguments } from "@aeroware/aeroclient";
import utils from "@aeroware/discord-utils";
import { config as dotenv } from "dotenv";
import connect from "./database/connect";
import users from "./database/models/user";
import replies from "./utils/replies";

dotenv();

(async () => {
    await connect();

    const client = await AeroClient.create();

    Arguments.use(client);

    client.use(async ({ message, command }, next, stop) => {
        if (/<@!?814209052376301599>/.test(message.content)) {
            const reply = replies[Math.floor(Math.random() * replies.length)];

            message.channel.startTyping();

            await utils.aDelayOf(reply.length * 10);

            message.channel.stopTyping();

            message.channel.send(reply);

            return stop();
        }

        const user = await users.findById(message.author.id);

        if (!user && command && command.name !== "start") {
            message.channel.send(`Start investing by using \`${client.defaultPrefix}start\`!`);

            return stop();
        }

        return next();
    });
})();
