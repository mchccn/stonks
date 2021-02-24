import dotenv from "dotenv";
import PolygonClient from "./lib/PolygonClient.js";

dotenv.config();

(async () => {
    const polygonClient = new PolygonClient(process.env.API_KEY);

    console.log(await polygonClient.retrieveStocks("TSLA"));
})();
