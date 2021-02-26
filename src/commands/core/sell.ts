import { Arguments } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageReaction, User } from "discord.js";
import users from "../../database/models/user";
import manager from "../../utils/manager";

export default {
    name: "sell",
    aliases: ["unpurchase", "uninvest"],
    args: true,
    usage: "<ticker> [amount]",
    metasyntax: Arguments.compile(`<ticker> [amount]`, {
        ticker: "string",
        amount: "integer",
    }),
    description: "Sell some shit.",
    details: "This is the part where you say 'fuck the stock market'.",
    category: "stocks shit",
    cooldown: 10,
    async callback({ message, parsed, client }) {
        const user = (await users.findById(message.author.id))!;

        const ticker = (parsed[0] as string).toUpperCase();

        const amount = (parsed[1] as number) || 1;

        const json = await manager.fetchStocks(ticker);

        if (!json || !json.results) {
            message.channel.send(`There isn't a company with that ticker bruh.`);
            return "invalid";
        }

        if (!user.portfolio.find((s) => s.ticker === ticker)) {
            message.channel.send(`You don't have any fucking shares of ${ticker}.`);
            return "invalid";
        }

        if (user.portfolio.find((s) => s.ticker === ticker)?.count! < amount) {
            message.channel.send(`You don't have that many shares of ${ticker}.`);
            return "invalid";
        }

        const refund = json.results[0].c * amount;

        const confirm = await message.channel.send(
            `Do you really want to sell **${amount} shares of ${ticker}** for **${refund} fucking dollars**?`
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
            message.channel.send(`Unpurchase canceled.`);
            return "invalid";
        }

        user.balance += refund;

        const stock = user.portfolio.findIndex((s) => s.ticker === ticker);

        if (stock >= 0) user.portfolio[stock].count -= amount;

        await user.save();

        return message.channel.send(`You sold **${amount} shares of ${ticker}** for **${refund} fucking dollars**!`);
    },
} as Command;
