import { AeroEmbed } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import manager from "../../utils/manager";

export default {
    name: "get",
    aliases: ["find", "stocks"],
    args: true,
    usage: "<ticker>",
    description: "Look up a ticker's previous close.",
    details: "Stocks are complicated shit you know?",
    category: "classified as spyware",
    cooldown: 10,
    async callback({ message, args }) {
        const json = await manager.fetchStocks(args[0].toUpperCase());

        if (!json || !json.results) return message.channel.send(`There isn't a company with that ticker.`);

        const { o, h, l, c, v, vw, t, n } = json.results[0];

        return message.channel.send(
            new AeroEmbed().setTitle(`Previous close for ${json.ticker}`).setDescription(
                `\`\`\`
Open         | $${o}
High         | $${h}
Low          | $${l}
Close        | $${c}
Weighted     | $${vw}
Volume       | ${v}
Timestamp    | ${new Date(t).toDateString()}
Transactions | ${n}
\`\`\``
            )
        );
    },
} as Command;
