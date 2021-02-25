import { AeroEmbed } from "@aeroware/aeroclient";
import manager from "./manager";

const pad = <T>(l: number, a: T[], v: T) => [...a, ...new Array(l).fill(v).slice(0, a.length)];

export default async function formatPortfolio(portfolio: {
    [ticker: string]: {
        name: string;
        count: number;
    };
}) {
    const tickers = Object.keys(portfolio);

    const amount = 5;

    const fields = await Promise.all(
        tickers
            .map(async (_, i) =>
                i % amount
                    ? undefined!
                    : Promise.all(
                          tickers.slice(i, Math.floor(i / amount) * amount + amount).map(async (ticker) => ({
                              ticker,
                              ...portfolio[ticker],
                              price: (await manager.fetchStocks(ticker)).results[0].c,
                          }))
                      )
            )
            .filter(($) => $)
    );

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
