import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageAttachment, MessageEmbed } from "discord.js";
import * as Canvas from "canvas";
export default {
  name: "stonks",
  description: "Stonks",
  details: "Stonks",
  category: "canvas",
  cooldown: 10,
  async callback({ message }) {
    // const Canvas: any = canvas.createCanvas(1280, 720);
    // const ctx: any = Canvas.getContext("2d");
    // const background = canvas.loadImage(
    //   "https://cdn.discordapp.com/attachments/813942906791395331/814919459810574406/stonk.jpg"
    // );
    // ctx.drawImage(background, 0, 0, Canvas.width, Canvas.height);
    // const avatar = await Canvas.loadImage(
    //   targetUser.displayAvatarURL({ format: "jpg" })
    // );
    // ctx.drawImage(avatar, 160, 320, 125, 125);
    // const attachment: any = await new MessageAttachment(
    //   Canvas.toBuffer(),
    //   "stonk.png"
    // );
    // let embed = new MessageEmbed()
    //   .setTitle("Stonks")
    //   .setColor("RANDOM")
    //   .setImage("attachment://stonk.png")
    //   .attachFiles(attachment);
    // message.channel.send(embed);
    let targetUser = message.mentions.users.first() || message.author;
    const canvas = Canvas.createCanvas(1280, 720);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(
      "https://cdn.discordapp.com/attachments/813942906791395331/814919459810574406/stonk.jpg"
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    const avatar = await Canvas.loadImage(
      targetUser.displayAvatarURL({ format: "jpg" })
    );
    ctx.drawImage(avatar, 210, 150, 250, 250);
    const attachment = await new MessageAttachment(
      canvas.toBuffer(),
      "stonks.png"
    );
    // let embed = new MessageEmbed()
    //   .setTitle("Stonks")
    //   .setColor("RANDOM")
    //   .setImage("attachment://stonks.png")
    //   .attachFiles(attachment);
    message.channel.send(attachment);
  },
} as Command;
