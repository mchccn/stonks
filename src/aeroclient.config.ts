import AeroClient from "@aeroware/aeroclient";
import { AeroClientOptions } from "@aeroware/aeroclient/dist/types";

export default {
    token: process.env.TOKEN,
    prefix: ".",
    logging: true,
    commandsPath: "commands",
    disableStaffCooldowns: true,
    staff: ["508442553754845184"],
    responses: {
        cooldown: "Can you just fucking chill? You still need to wait $TIME.",
        error: "Oh fuck you made me screw up.",
        staff: "Did you just try to impersonate my staff?",
        usage: "God, that's not how you use it you nonce. You use it as `$PREFIX$COMMAND $USAGE`.",
    },
    readyCallback(this: AeroClient) {
        this.logger.success(`stonks is ready!`);

        this.user!.setActivity({
            type: "WATCHING",
            name: "some fucking stocks",
        });
    },
} as AeroClientOptions;
