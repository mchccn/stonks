import fetch from "node-fetch";

export default class PolygonClient {
    public apiKey!: string;
    public baseURL!: string;
    public tickerCache!: { [ticker: string]: any };
    public tickerRateLimitMap!: Map<string, number>;
    public dailyCache!: { [day: string]: any };
    public detailsCache!: { [ticker: string]: any };
    public bannedTickers!: string[];
    public bannedDates!: string[];

    public constructor(apiKey: string) {
        this.apiKey = apiKey;

        this.baseURL = `https://api.polygon.io`;

        this.tickerCache = {};
        this.tickerRateLimitMap = new Map();

        this.dailyCache = {};

        this.detailsCache = {};

        this.bannedTickers = [];
        this.bannedDates = [];
    }

    public async fetchStocks(ticker: string) {
        if (this.bannedTickers.includes(ticker)) return {};

        if (this.tickerCache[ticker] && this.tickerRateLimitMap.get(ticker)! > Date.now()) return this.tickerCache[ticker];

        const res = await fetch(this.authorize(`${this.baseURL}/v2/aggs/ticker/${ticker}/prev?unadjusted=true`));

        const json = await res.json();

        if (res.ok && json.results) this.tickerCache[ticker] = json;

        if (!json.results) this.bannedTickers.push(ticker);

        this.tickerRateLimitMap.set(ticker, Date.now() + 1000 * 60);

        return json;
    }

    public async fetchDetails(ticker: string) {
        if (this.bannedTickers.includes(ticker)) return {};

        if (this.detailsCache[ticker] && this.tickerRateLimitMap.get(ticker)! > Date.now()) return this.detailsCache[ticker];

        const res = await fetch(this.authorize(`${this.baseURL}/v1/meta/symbols/${ticker}/company?`));

        const json = await res.json();

        if (res.ok) this.detailsCache[ticker] = json;

        if (json.error) this.bannedTickers.push(ticker);

        this.tickerRateLimitMap.set(ticker, Date.now() + 1000 * 60);

        return json;
    }

    public async fetchDaily(date: Date) {
        const d = date.toISOString().slice(0, 10);

        if (this.bannedDates.includes(d)) return {};

        if (this.dailyCache[d]) return this.dailyCache[d];

        const res = await fetch(this.authorize(`${this.baseURL}/v2/aggs/grouped/locale/us/market/stocks/${d}?unadjusted=true`));

        const json = await res.json();

        if (res.ok && json.results) this.dailyCache[d] = json;

        if (!json.results) this.bannedDates.push(d);

        return json;
    }

    public authorize(apiRoute: string) {
        return `${apiRoute}&apiKey=${this.apiKey}`;
    }
}
