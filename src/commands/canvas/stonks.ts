import { AeroEmbed, Arguments } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import * as Canvas from "canvas";
import { MessageAttachment, User } from "discord.js";
export default {
    name: "stonks",
    args: false,
    usage: "[user]",
    metasyntax: Arguments.compile(`[user]`),
    description: "stonks",
    details: "stonks",
    category: "canvas",
    cooldown: 10,
    async callback({ message, parsed }) {
        const user = (parsed[0] || message.author) as User;

        const canvas = Canvas.createCanvas(1280, 720);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage(
            "https://cdn.discordapp.com/attachments/813942906791395331/814919459810574406/stonk.jpg"
        );
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: "png", size: 512 }));

        ctx.beginPath();

        ctx.arc(85 + 425 / 2, 35 + 425 / 2, 425 / 2, 0, Math.PI * 2, true);

        ctx.closePath();

        ctx.clip();

        ctx.drawImage(avatar, 85, 35, 425, 425);

        const attachment = new MessageAttachment(canvas.toBuffer(), "stonks.png");

        return message.channel.send(
            new AeroEmbed().setTitle("gud luk on ur stonks").attachFiles([attachment]).setImage("attachment://stonks.png")
        );
    },
} as Command;
