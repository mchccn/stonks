import ClientManager from "../lib/ClientManager";

const keys = Object.keys(process.env)
    .filter((k) => k.startsWith("API_KEY"))
    .map((k) => process.env[k] as string);

const manager = new ClientManager(keys);

(async () => {
    await manager.fetchDaily(new Date(new Date().setDate(new Date().getDate() - 1)));

    setInterval(async () => {
        await manager.fetchDaily(new Date(new Date().setDate(new Date().getDate() - 1)));

        manager.graphCache = {};
    }, 1000 * 60 * 60 * 24);
})();

export default manager;
