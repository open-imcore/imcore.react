export function splitPartIDIntoParts(id: string): [string, string] {
    const [ part, messageID ] = id.split(id.includes("/") ? "/" : ":");

    return [ part, messageID ];
}