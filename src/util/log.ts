import { ConsoleFormattedStream, createLogger } from "browser-bunyan";

const sharedStream = new ConsoleFormattedStream();

export default function IMMakeLog(namespace: string, level: string | number | undefined = "debug") {
    return createLogger({
        name: namespace,
        stream: sharedStream,
        level
    });
}

export const IMLog = IMMakeLog("IMCore");