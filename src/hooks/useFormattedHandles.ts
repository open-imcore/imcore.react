import parsePhoneNumber from "libphonenumber-js";
import { useSelector } from "react-redux";
import { selectHandleIDToContact } from "../app/reducers/contacts";

const cache: Record<string, string> = {};

export function formatPhoneNumber(rawPhoneNumber: string): string {
    try {
        if (cache[rawPhoneNumber]) return cache[rawPhoneNumber];

        const phoneNumber = parsePhoneNumber(rawPhoneNumber);
        if (!phoneNumber) return rawPhoneNumber;
        else return cache[rawPhoneNumber] = `+${phoneNumber.countryCallingCode} ${phoneNumber.formatNational()}`;
    } catch {
        return rawPhoneNumber;
    }
}

export function useFormattedHandles(handleIDs: string[]): string[] {
    const handleIDToContact = useSelector(selectHandleIDToContact);
    
    return handleIDs.map(handleID => {
        const contact = handleIDToContact[handleID];
        if (contact) return contact.fullName || handleID;
        else return formatPhoneNumber(handleID);
    });
}

export function useFormattedHandle(handleID: string | undefined): string {
    const handleIDToContact = useSelector(selectHandleIDToContact);

    if (!handleID) return "You";
    else {
        const contact = handleIDToContact[handleID];
        if (contact) return contact.fullName || handleID;
        else return formatPhoneNumber(handleID);
    }
}