import { AeroEmbed } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import manager from "../../utils/manager";

export default {
    name: "lookup",
    aliases: ["stalk", "spy"],
    args: true,
    usage: "<ticker>",
    description: "Look up a ticker's details.",
    details: "Stalking a company is fun.",
    category: "classified as spyware",
    cooldown: 10,
    async callback({ message, args }) {
        const json = await manager.fetchDetails(args[0].toUpperCase());

        if (!json || json.error) return message.channel.send(`There isn't a company with that ticker.`);

        return message.channel.send(
            new AeroEmbed()
                .setTitle(json.name)
                .setURL(json.url)
                .setDescription(json.description)
                .setThumbnail(json.logo)
                .addField(`Exchange: ${json.exchange} (${json.exchangeSymbol})`, `Sector: ${json.sector}`)
                .addField("Tags", json.tags.join("\n") || "None")
        );
    },
} as Command;
