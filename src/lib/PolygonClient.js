import fetch from "node-fetch";
import tickers from "./tickers.js";

/**
 * An API to interact with polygon.io's stock API.
 * Abstracts HTTP requests into asynchronous methods.
 * @class
 */
export default class PolygonClient {
    constructor(apiKey) {
        this.apiKey = apiKey;

        this.baseURL = `https://api.polygon.io/v2`;

        this.cache = {};

        this.rateLimitMap = new Map();
    }

    /**
     * Retrieves JSON about a specific stock with a ticker.
     * @param {string} ticker Stock ticker to look up.
     */
    async retrieveStocks(ticker) {
        if (!tickers.includes(ticker)) throw new Error("Invalid stock ticker.");

        if (this.cache[ticker] && this.rateLimitMap.get(ticker) > Date.now())
            return this.cache[ticker];

        const json = await (await fetch(this.authorize(`${this.baseURL}/aggs/ticker/${ticker}/prev?unadjusted=true`))).json();

        this.cache[ticker] = json;

        this.rateLimitMap.set(ticker, Date.now() + 1000 * 60 * 60); // 1 hour cooldown

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
