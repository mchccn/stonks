import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageReaction, User } from "discord.js";
import users from "../../database/models/user";

export default {
    name: "start",
    aliases: ["restart", "join"],
    args: false,
    usage: "",
    description: "Start investing in stocks.",
    details: "Stocks are a good way to make money if you don't fuck up.",
    category: "the fucking entrance",
    cooldown: 3600,
    async callback({ message }) {
        const user = await users.findById(message.author.id);

        if (user) {
            const confirm = await message.channel.send(
                `It seems like you already have a portfolio. Are you sure you want to fucking restart?`
            );

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

            await user.delete();
        }

        const newUser = await users.create({
            _id: message.author.id,
        });

        return message.channel.send(
            `You have registered${user ? " again" : ""} and was given **${
                newUser.balance / 1000
            }K fucking dollars** to start your ${user ? "new " : ""}portfolio!`
        );
    },
} as Command;
