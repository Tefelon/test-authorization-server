
export function JsonParse (json: string, replacement: any): any {
    let outJsonParse: string;

    try {
        outJsonParse = JSON.parse(json);
        if (outJsonParse === undefined || outJsonParse === null) {
            outJsonParse = replacement;
        }
    } catch (e) {
        outJsonParse = replacement;
    }
    return outJsonParse;
}


export function getExpirationDate(exp: number = 0): number {
    return Math.round( +new Date() / 1000) + exp;
}