import ClientManager from "../lib/ClientManager";

const keys = Object.keys(process.env)
    .filter((k) => k.startsWith("API_KEY"))
    .map((k) => process.env[k] as string);

const manager = new ClientManager(keys);

export default manager;
