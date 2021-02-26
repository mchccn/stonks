import { AeroEmbed, Arguments } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { createCanvas } from "canvas";
import { MessageAttachment } from "discord.js";
import NiceScale from "../../lib/NiceScale";
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
        let buffer: Buffer;

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

            const canvas = createCanvas(512, 256);
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#fafafa";

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "12px Arial";

            ctx.fillStyle = "#000000";

            ctx.beginPath();

            ctx.moveTo(48, 12);
            ctx.lineTo(48, canvas.height - 32);

            ctx.textAlign = "center";

            const { niceMin, spacing } = new NiceScale(min, max, (max - min) / 5);

            for (let i = canvas.height - 32; i >= 12; i -= (canvas.height - 44) / (spacing - 1)) {
                ctx.moveTo(48, i);
                ctx.lineTo(canvas.width - 12, i);

                const text = (
                    niceMin +
                    Math.round(((i / ((canvas.height - 32) / (spacing - 1))) * spacing - 1) / spacing) * spacing
                ).toString();

                ctx.fillText(text, ctx.measureText(text).width + 2, i + 4);
            }
            0;

            ctx.closePath();

            ctx.stroke();

            ctx.strokeStyle = "#555555";

            ctx.beginPath();

            ctx.font = "10px Arial";

            for (let i = 10; i >= 1; i--) {
                ctx.moveTo(i * ((canvas.width - 60) / 9) - 2, 12);
                ctx.lineTo(i * ((canvas.width - 60) / 9) - 2, canvas.height - 32);

                ctx.save();

                ctx.translate(i * ((canvas.width - 60) / 9) - 6, canvas.height - 12);

                ctx.rotate(Math.PI * 1.75);

                ctx.fillText(
                    new Date(new Date().setDate(new Date().getDate() - (10 - i + 1))).toISOString().slice(5, 10),
                    0,
                    0
                );

                ctx.restore();
            }

            ctx.moveTo(canvas.width - 12, 12);
            ctx.lineTo(canvas.width - 12, canvas.height - 32);

            ctx.closePath();

            ctx.stroke();

            buffer = canvas.toBuffer();

            manager.graphCache[ticker] = buffer;
        } else buffer = manager.graphCache[ticker];

        const attachment = new MessageAttachment(buffer, "graph.png");

        return message.channel.send(
            new AeroEmbed().setTitle(`Graph for ${ticker}`).attachFiles([attachment]).setImage("attachment://graph.png")
        );
    },
} as Command;
