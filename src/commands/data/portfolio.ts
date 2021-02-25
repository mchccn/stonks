import { AeroEmbed, Arguments, utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { User } from "discord.js";
import users from "../../database/models/user";
import formatPortfolio from "../../utils/formatPortfolio";
import manager from "../../utils/manager";

export default {
    name: "portfolio",
    aliases: ["profile", "p"],
    args: false,
    usage: "[user]",
    metasyntax: Arguments.compile(`[user]`),
    description: "Look at your shit portfolio.",
    details: "View your portfolio full of fucking crap.",
    category: "the fucking exit",
    cooldown: 3600,
    async callback({ message, parsed, client }) {
        let user = (await users.findById(message.author.id))!;

        if (parsed![0]) {
            const otherUser = await users.findById((parsed![0] as User).id);

            if (!otherUser) {
                message.channel.send(`They're not even investing you fucking idiot.`);

                return "invalid";
            }

            user = otherUser;
        }

        const apiUser = await client.users.fetch(user._id);

        return utils.paginate(
            message,
            [
                new AeroEmbed()
                    .setTitle(`${apiUser.username}'s portfolio`)
                    .addField(
                        `Your balance is $${user.balance.toLocaleString()}`,
                        `Your portfolio's net worth is ${(
                            await Promise.all(Object.keys(user.portfolio).map((ticker) => manager.fetchStocks(ticker)))
                        )
                            .map(({ ticker, results }) => user.portfolio[ticker].count * results[0].c)
                            .reduce((a, b) => a + b, 0)}`
                    ),
                ...formatPortfolio(user.portfolio),
            ],
            {
                time: 120000,
                fastForwardAndRewind: {
                    fastForwardPrompt: "How many pages do you want to skip bitch?",
                    rewindPrompt: "How many pages do you want to skip bitch?",
                    time: 10000,
                },
                goTo: {
                    prompt: "Where do you want to hop to bitch?",
                    time: 10000,
                },
            }
        );
    },
} as Command;
