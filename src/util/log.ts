import { ConsoleFormattedStream, createLogger, resolveLevel } from "browser-bunyan";

const sharedStream = new ConsoleFormattedStream();

type Logger = ReturnType<typeof createLogger>

interface IMLogger extends Logger {
    maybeDebug(cb: () => any[]): void;
}

function makeMaybeLogger(logger: Logger, configLevel: number, requiredLevel: number) {
    if (configLevel > requiredLevel) return (cb: () => any[]) => undefined;
    else return (cb: () => any[]) => (logger.debug as any)(...cb());
}

export default function IMMakeLog(namespace: string, level: string | number | undefined = "debug"): IMLogger {
    const logger = createLogger({
        name: namespace,
        stream: sharedStream,
        level
    });

    const resolvedLevel = resolveLevel(level);

    return Object.assign(logger, {
        maybeDebug: makeMaybeLogger(logger, resolvedLevel, resolveLevel("debug"))
    });
}

export const IMLog = IMMakeLog("IMCore");