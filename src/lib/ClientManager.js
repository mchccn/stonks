const PolygonClient = require("./PolygonClient");

/**
 * Oversees resource use and manages PolygonClients.
 *
 * @class
 */
class ClientManager {
    static instance;

    /**
     * Constructs a new ClientManager instance.
     * @param {string[]} keys API keys to use.
     */
    constructor(keys) {
        if (ClientManager.instance) return instance;

        this.index = 0;
        this.clients = keys.map((k) => new PolygonClient(k));

        this.tickerCache = {};
        this.dailyCache = {};
        this.detailsCache = {};

        this.bannedTickers = [];
        this.bannedDates = [];

        setInterval(() => {
            this.bannedTickers = [...new Set(this.clients.flatMap((c) => c.bannedTickers))];
            this.clients.forEach((c) => (c.bannedTickers = this.bannedTickers));

            this.bannedDates = [...new Set(this.clients.flatMap((c) => c.bannedDates))];
            this.clients.forEach((c) => (c.bannedDates = this.bannedDates));

            this.clients.map((c) => c.dailyCache).map((c) => (this.dailyCache = { ...this.dailyCache, ...c }));
            this.clients.forEach((c) => (c.dailyCache = this.dailyCache));

            this.clients.map((c) => c.detailsCache).map((c) => (this.detailsCache = { ...this.detailsCache, ...c }));
            this.clients.forEach((c) => (c.detailsCache = this.detailsCache));
        }, 1000 * 60 * 5);

        ClientManager.instance = this;
    }

    /**
     * Fetches JSON about a specific stock with a ticker.
     * @param {string} ticker Stock ticker to look up.
     */
    async fetchStocks(ticker) {
        const client = this.clients[this.index++ % this.clients.length];

        const json = await client.fetchStocks(ticker);

        return json;
    }

    /**
     * Fetches JSON with company details for a ticker.
     * @param {string} ticker Stock ticker to look up.
     */
    async fetchDetails(ticker) {
        const client = this.clients[this.index++ % this.clients.length];

        const json = await client.fetchDetails(ticker);

        return json;
    }

    /**
     * Fetches JSON for a specific date's OHLC.
     * @param {Date} date Date to look up.
     */
    async fetchDaily(date) {
        const d = date.toISOString().slice(0, 10);

        const cachedDaily = this.clients.find((c) => c.dailyCache[d]);

        if (cachedDaily) return cachedDaily.dailyCache[d];

        if (this.dailyCache[d]) return this.dailyCache[d];

        const client = this.clients[this.index++ % this.clients.length];

        const json = await client.fetchDaily(date);

        if (json.results) this.dailyCache[d] = json;

        return json;
    }

    /**
     * Gets JSON for a ticker from the cache, if it exists.
     * @param {string} ticker Ticker to get from cache.
     */
    getStocks(ticker) {
        const cachedTicker = this.clients.find((c) => c.tickerCache[ticker]);

        if (cachedTicker) this.tickerCache[ticker] = cachedTicker.tickerCache[ticker];

        return cachedTicker ? cachedTicker.tickerCache[ticker] : undefined;
    }

    /**
     * Gets JSON for a ticker's details from the cache, if it exists.
     * @param {string} ticker Ticker to get from cache.
     */
    getDetails(ticker) {
        const cachedTicker = this.clients.find((c) => c.detailsCache[ticker]);

        if (cachedTicker) this.detailsCache[ticker] = cachedTicker.detailsCache[ticker];

        return cachedTicker ? cachedTicker.detailsCache[ticker] : undefined;
    }

    /**
     * Gets JSON for a date from the cache, if it exists.
     * @param {Date} date Date to get from cache.
     */
    getDaily(date) {
        const d = date.toISOString().slice(0, 10);

        const cachedDaily = this.clients.find((c) => c.dailyCache[d]);

        if (cachedDaily) this.dailyCache[d] = cachedDaily.dailyCache[d];

        return cachedDaily ? cachedDaily.dailyCache[d] : undefined;
    }
}

module.exports = ClientManager;
