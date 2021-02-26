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
    category: "utility",
    cooldown: 10,
    async callback({ message, parsed, client }) {
        let user = (await users.findById(message.author.id))!;

        if (parsed[0]) {
            const otherUser = await users.findById((parsed[0] as User).id);

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
                        `${
                            user._id === message.author.id ? "Your" : `${apiUser.username}'s`
                        } balance is $${user.balance.toLocaleString()}`,
                        `${user._id === message.author.id ? "Your" : `${apiUser.username}'s`} portfolio's net worth is ${(
                            await Promise.all(user.portfolio.map((stock) => manager.fetchStocks(stock.ticker)))
                        )
                            .map(({ results }, i) => user.portfolio[i].count * results[0].c)
                            .reduce((a, b) => a + b, 0)}`
                    ),
                ...(await formatPortfolio(user.portfolio)),
            ],
            {
                time: 120000,
                goTo: {
                    prompt: "Where do you want to hop to bitch?",
                    time: 10000,
                },
            }
        );
    },
} as Command;
