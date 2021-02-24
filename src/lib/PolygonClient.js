const fetch = require("node-fetch");

/**
 * An API to interact with polygon.io's stock API.
 * Abstracts HTTP requests into asynchronous methods.
 * @class
 */
class PolygonClient {
    /**
     * Creates a PolygonClient instance.
     * @param {string} apiKey API key to use.
     */
    constructor(apiKey) {
        this.apiKey = apiKey;

        this.baseURL = `https://api.polygon.io`;

        this.tickerCache = {};
        this.tickerRateLimitMap = new Map();

        this.dailyCache = {};

        this.detailsCache = {};

        this.bannedTickers = [];
        this.bannedDates = [];
    }

    /**
     * Fetches JSON about a specific stock with a ticker.
     * @param {string} ticker Stock ticker to look up.
     */
    async fetchStocks(ticker) {
        if (this.bannedTickers.includes(ticker)) return {};

        if (this.tickerCache[ticker] && this.tickerRateLimitMap.get(ticker) > Date.now()) return this.tickerCache[ticker];

        const res = await fetch(this.authorize(`${this.baseURL}/v2/aggs/ticker/${ticker}/prev?unadjusted=true`));

        const json = await res.json();

        if (res.ok && json.results) this.tickerCache[ticker] = json;

        if (!json.results) this.bannedTickers.push(ticker);

        this.tickerRateLimitMap.set(ticker, Date.now() + 1000 * 60);

        return json;
    }

    /**
     * Fetches JSON with company details for a ticker.
     * @param {string} ticker Stock ticker to look up.
     */
    async fetchDetails(ticker) {
        if (this.bannedTickers.includes(ticker)) return {};

        if (this.detailsCache[ticker] && this.tickerRateLimitMap.get(ticker) > Date.now()) return this.detailsCache[ticker];

        const res = await fetch(this.authorize(`${this.baseURL}/v1/meta/symbols/${ticker}/company?`));

        const json = await res.json();

        if (res.ok) this.detailsCache[ticker] = json;

        if (json.error) this.bannedTickers.push(ticker);

        this.tickerRateLimitMap.set(ticker, Date.now() + 1000 * 60);

        return json;
    }

    /**
     * Fetches JSON for a specific date's OHLC.
     * @param {Date} date Date to look up.
     */
    async fetchDaily(date) {
        const d = date.toISOString().slice(0, 10);

        if (this.bannedDates.includes(d)) return {};

        if (this.dailyCache[d]) return this.dailyCache[d];

        const res = await fetch(this.authorize(`${this.baseURL}/v2/aggs/grouped/locale/us/market/stocks/${d}?unadjusted=true`));

        const json = await res.json();

        if (res.ok && json.results) this.dailyCache[d] = json;

        if (!json.results) this.bannedDates.push(d);

        return json;
    }

    /**
     * Appends the API key to the end for authorization.
     * @param {string} apiRoute API route to authorize.
     */
    authorize(apiRoute) {
        return `${apiRoute}&apiKey=${this.apiKey}`;
    }
}

module.exports = PolygonClient;
