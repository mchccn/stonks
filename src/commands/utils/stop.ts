import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageReaction, User } from "discord.js";
import users from "../../database/models/user";

export default {
    name: "stop",
    aliases: ["quit", "resign"],
    args: false,
    usage: "",
    description: "Quit investing in stocks.",
    details: "Stocks are only for the bravest of the brave.",
    category: "the fucking exit",
    cooldown: 3600,
    async callback({ message }) {
        const user = await users.findById(message.author.id);

        const confirm = await message.channel.send(`Are you really sure you want to fucking quit this crap?`);

        await confirm.react("❌");
        await confirm.react("✅");

        const choice = (
            await confirm.awaitReactions(
                (r: MessageReaction, u: User) => ["❌", "✅"].includes(r.emoji.name) && u.id === message.author.id,
                {
                    max: 1,
                    time: 10000,
                }
            )
        ).first()?.emoji.name;

        if (!choice || choice === "❌") {
            message.channel.send(`Restart canceled.`);
            return "invalid";
        }

        if (user) await user.delete();

        return message.channel.send(`You have resigned and decided to take a short break from investing and stocks shit.`);
    },
} as Command;
