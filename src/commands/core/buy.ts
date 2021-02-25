import { Arguments } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageReaction, User } from "discord.js";
import users from "../../database/models/user";
import manager from "../../utils/manager";

export default {
    name: "buy",
    aliases: ["purchase", "invest"],
    args: false,
    usage: "<ticker> [amount]",
    metasyntax: Arguments.compile(`<ticker> [amount]`, {
        ticker: "string",
        amount: "integer",
    }),
    description: "Buy some shit.",
    details: "This is the part where you actually invest.",
    category: "stocks shit",
    cooldown: 10,
    async callback({ message, parsed, client }) {
        const user = (await users.findById(message.author.id))!;

        const ticker = (parsed![0] as string).toUpperCase();

        const amount = (parsed![1] as number) || 1;

        const json = await manager.fetchStocks(ticker);

        if (!json || !json.results) return message.channel.send(`There isn't a company with that ticker bruh.`);

        const cost = json.results[0].c * amount;

        if (user.balance < cost) {
            message.channel.send(
                `You don't have enough money bruh. You need **${cost} dollars** to buy **${amount} share${
                    amount !== 1 ? "s" : ""
                }**.`
            );

            return "invalid";
        }

        const confirm = await message.channel.send(
            `Do you really want to spend **${cost} fucking dollars** for only **${amount} share${amount !== 1 ? "s" : ""}**?`
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
            message.channel.send(`Investment canceled.`);
            return "invalid";
        }

        const details = await manager.fetchDetails(ticker);

        user.balance -= cost;

        user.portfolio[ticker]
            ? (user.portfolio[ticker].count += amount)
            : (user.portfolio[ticker] = {
                  count: amount,
                  name: details.name,
              });

        await user.save();

        return message.channel.send(
            `You spent **${cost} fucking dollars** for **${amount} share${amount !== 1 ? "s" : ""}** of ${details.name}!`
        );
    },
} as Command;
