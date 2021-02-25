import { AeroEmbed } from "@aeroware/aeroclient";

export default function formatPortfolio(portfolio: {
    [ticker: string]: {
        name: string;
        count: number;
    };
}) {
    const tickers = Object.keys(portfolio);

    const amount = 5;

    const fields = tickers
        .map((_, i) =>
            i % amount
                ? undefined!
                : tickers.slice(i, Math.floor(i / amount) * amount + amount).map((ticker) => ({ ticker, ...portfolio[ticker] }))
        )
        .filter(($) => $);

    const pages = fields.map((f) =>
        new AeroEmbed().addFields(
            f.map((t) => ({
                name: `${t.ticker} (${t.name}) – ${t.count} share${t.count !== 1 ? "s" : ""}`,
                value: "\u200b",
            })) // ! pad the array
        )
    );

    return pages;
}
