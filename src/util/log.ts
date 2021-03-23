import { createLogger, ConsoleFormattedStream } from "browser-bunyan";

const sharedStream = new ConsoleFormattedStream();

export default function IMMakeLog(namespace: string) {
    return createLogger({
        name: namespace,
        stream: sharedStream,
        level: "debug"
    });
}

export const IMLog = IMMakeLog('IMCore')