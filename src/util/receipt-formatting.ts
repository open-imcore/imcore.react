import { DateTime } from "luxon"
import { useEffect, useLayoutEffect, useState } from "react"

export function useFormattedReceipt(millis: number | null) {
    const [formattedReceipt, setFormattedReceipt] = useState(null as string | null)

    useLayoutEffect(() => {
        if (millis === null) {
            setFormattedReceipt(null);
            return;
        }

        const parsed = DateTime.fromMillis(millis)
        if (parsed.hasSame(DateTime.local(), "day")) {
            setFormattedReceipt(parsed.toLocaleString(DateTime.TIME_SIMPLE))
        } else if (parsed.hasSame(DateTime.local().minus({ day: 1 }), "day")) {
            setFormattedReceipt(parsed.toRelativeCalendar())
        } else {
            setFormattedReceipt(parsed.toLocaleString(DateTime.DATE_SHORT))
        }
    }, [millis]);

    return formattedReceipt
}

export function useFormattedTimestamp(millis: number | null) {
    const [formattedTimestamp, setFormattedTimestamp] = useState(null as { date: string; time: string; } | null);

    useLayoutEffect(() => {
        if (millis === null) {
            setFormattedTimestamp(null);
            return;
        }

        const parsed = DateTime.fromMillis(millis);

        const now = DateTime.local();

        if (parsed.hasSame(now, "day") || parsed.hasSame(now.minus({ day: 1 }), "day")) {
            var date = parsed.toRelativeCalendar() || parsed.toLocaleString(DateTime.DATE_SHORT);
            date = date.replace(date[0], date[0].toUpperCase())
        } else {
            var date = parsed.toLocaleString(DateTime.DATE_SHORT);
        }

        setFormattedTimestamp({
            date,
            time: parsed.toLocaleString(DateTime.TIME_SIMPLE)
        });
    }, [millis]);

    return formattedTimestamp;
}