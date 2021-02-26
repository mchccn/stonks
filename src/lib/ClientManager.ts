import PolygonClient from "./PolygonClient";

export default class ClientManager {
    public static instance: ClientManager;

    public index!: number;
    public clients!: PolygonClient[];
    public graphCache!: { [ticker: string]: any };
    public tickerCache!: { [ticker: string]: any };
    public dailyCache!: { [day: string]: any };
    public detailsCache!: { [ticker: string]: any };
    public bannedTickers!: string[];
    public bannedDates!: string[];

    public constructor(keys: string[]) {
        if (ClientManager.instance) return ClientManager.instance;

        this.index = 0;
        this.clients = keys.map((k) => new PolygonClient(k));

        this.tickerCache = {};
        this.dailyCache = {};
        this.detailsCache = {};
        this.graphCache = {};

        this.bannedTickers = [];
        this.bannedDates = [];

        setInterval(() => {
            this.bannedTickers = [...new Set(this.clients.flatMap((c) => c.bannedTickers))];
            this.clients.forEach((c) => (c.bannedTickers = this.bannedTickers));

            this.bannedDates = [...new Set(this.clients.flatMap((c) => c.bannedDates))];
            this.clients.forEach((c) => (c.bannedDates = this.bannedDates));

            this.clients.map((c) => c.tickerCache).map((c) => (this.tickerCache = { ...this.tickerCache, ...c }));
            this.clients.forEach((c) => (c.tickerCache = this.tickerCache));

            this.clients.map((c) => c.dailyCache).map((c) => (this.dailyCache = { ...this.dailyCache, ...c }));
            this.clients.forEach((c) => (c.dailyCache = this.dailyCache));

            this.clients.map((c) => c.detailsCache).map((c) => (this.detailsCache = { ...this.detailsCache, ...c }));
            this.clients.forEach((c) => (c.detailsCache = this.detailsCache));
        }, 1000 * 60 * 5);

        ClientManager.instance = this;
    }

    public async fetchStocks(ticker: string) {
        const client = this.clients[this.index++ % this.clients.length];

        const json = await client.fetchStocks(ticker);

        return json;
    }

    public async fetchDetails(ticker: string) {
        const client = this.clients[this.index++ % this.clients.length];

        const json = await client.fetchDetails(ticker);

        return json;
    }

    public async fetchDaily(date: Date) {
        const d = date.toISOString().slice(0, 10);

        const cachedDaily = this.clients.find((c) => c.dailyCache[d]);

        if (cachedDaily) return cachedDaily.dailyCache[d];

        if (this.dailyCache[d]) return this.dailyCache[d];

        const client = this.clients[this.index++ % this.clients.length];

        const json = await client.fetchDaily(date);

        if (json && json.results) {
            this.dailyCache[d] = json;

            json.results.forEach((res: any) => {
                this.tickerCache[res.T] = {
                    ticker: res.T,
                    queryCount: 1,
                    resultsCount: 1,
                    adjusted: false,
                    results: [res],
                    status: "OK",
                    request_id: "f4a7ae3137e7085220538fd3dcfd0cd2",
                    count: 1,
                };
            });
        }

        return json;
    }

    public getStocks(ticker: string) {
        const cachedTicker = this.clients.find((c) => c.tickerCache[ticker]);

        if (cachedTicker) this.tickerCache[ticker] = cachedTicker.tickerCache[ticker];

        return cachedTicker ? cachedTicker.tickerCache[ticker] : undefined;
    }

    public getDetails(ticker: string) {
        const cachedTicker = this.clients.find((c) => c.detailsCache[ticker]);

        if (cachedTicker) this.detailsCache[ticker] = cachedTicker.detailsCache[ticker];

        return cachedTicker ? cachedTicker.detailsCache[ticker] : undefined;
    }

    public getDaily(date: Date) {
        const d = date.toISOString().slice(0, 10);

        const cachedDaily = this.clients.find((c) => c.dailyCache[d]);

        if (cachedDaily) this.dailyCache[d] = cachedDaily.dailyCache[d];

        return cachedDaily ? cachedDaily.dailyCache[d] : undefined;
    }
}
