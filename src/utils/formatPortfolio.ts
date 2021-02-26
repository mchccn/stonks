import { AeroEmbed } from "@aeroware/aeroclient";
import manager from "./manager";

const pad = <T>(l: number, a: T[], v: T) => [...a, ...new Array(l).fill(v).slice(0, a.length)];

export default async function formatPortfolio(
    portfolio: {
        ticker: string;
        name: string;
        count: number;
    }[]
) {
    const amount = 5;

    const fields = (
        await Promise.all(
            portfolio.map((_, i) =>
                i % amount
                    ? undefined!
                    : Promise.all(
                          //@ts-ignore
                          portfolio.slice(i, Math.floor(i / amount) * amount + amount).map(async ({ _doc: stock }) => ({
                              ...stock,
                              price: (await manager.fetchStocks(stock.ticker)).results[0].c,
                          }))
                      )
            )
        )
    ).filter(($) => $);

    const pages = fields.map((f) =>
        new AeroEmbed().addFields(
            pad(
                5,
                f.map((t) => ({
                    name: `${t.ticker} (${t.name}) – ${t.count} share${t.count !== 1 ? "s" : ""} (worth $${t.count * t.price})`,
                    value: "\u200b",
                })),
                {
                    name: "\u200b",
                    value: "\u200b",
                }
            )
        )
    );

    return pages;
}
