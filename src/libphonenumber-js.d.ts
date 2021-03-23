declare module 'libphonenumber-js' {
    export type PhoneNumberType = "MOBILE" | "FIXED_LINE" | "FIXED_LINE_OR_MOBILE" | "PREMIUM_RATE" | "TOLL_FREE" | "SHARED_COST" | "VOIP" | "PERSONAL_NUMBER" | "PAGER" | "UAN" | "VOICEMAIL";

    export interface PhoneNumber {
        country: string;
        number: string;
        isValid(): boolean;
        getType(): PhoneNumberType;
        formatInternational(): string;
        formatNational(): string;
        countryCallingCode: string;
        getURI(): string;
        isPossible(): string;
        isNonGeographic(): boolean;
        isEqual(phoneNumber: PhoneNumber): boolean;
    }

    export default function parsePhoneNumber(phoneNumber: string, countryCode?: string): PhoneNumber | undefined;
}

declare module 'emoji-regex/RGI_Emoji' {
    function emojiRegex(): RegExp;

    export = emojiRegex;
}