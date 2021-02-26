import { AeroEmbed, Arguments } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { plot } from "asciichart";
import manager from "../../utils/manager";

export default {
    name: "graph",
    aliases: [],
    args: true,
    usage: "<ticker>",
    metasyntax: Arguments.compile(`<ticker>`, {
        ticker: "string",
    }),
    description: "Look at a graph.",
    details: "Graphs don't mean anything, really.",
    category: "classified as spyware",
    cooldown: 10,
    async callback({ message, parsed, client }) {
        let graph: string;

        const ticker = (parsed[0] as string).toUpperCase();

        if (!manager.graphCache[ticker]) {
            const json = await manager.fetchStocks(ticker);

            if (!json || !json.results) {
                message.channel.send(`There isn't a company with that ticker bruh.`);
                return "invalid";
            }

            const raw = (
                await Promise.all(
                    new Array(10)
                        .fill("")
                        .map((_, i) => manager.fetchDaily(new Date(new Date().setDate(new Date().getDate() - i - 1))))
                )
            )
                .map((d) => d && d.results)
                .map((r) => r && r.find((s: any) => s.T === ticker));

            const missing = raw.filter(($) => !$).length;

            const averages = ["v", "vw", "o", "c", "h", "l", "n"].reduce((obj, p) => {
                obj[p] = raw.reduce((a, b) => a + ((b && b[p]) || 0), 0) / (raw.length - missing);
                return obj;
            }, {} as any);

            const data = raw.map(
                (r) =>
                    r || {
                        T: "ticker",
                        ...averages,
                    }
            );

            const max = Math.ceil(Math.max(...data.map((d) => d.c)) / 10) * 10;
            const min = Math.floor(Math.min(...data.map((d) => d.c)) / 10) * 10;

            graph = plot(
                data.map((d) => d.c),
                {
                    height: 10,
                    max,
                    min,
                }
            );

            manager.graphCache[ticker] = graph;
        } else graph = manager.graphCache[ticker];

        return message.channel.send(
            new AeroEmbed()
                .setTitle(`Graph for ${ticker}`)
                .setDescription(
                    `\`\`\`\n${graph
                        .split("\n")
                        .map((l) => l.trim())
                        .join("\n")}\n\`\`\``
                )
                .setFooter("each character represents one day")
        );
    },
} as Command;
