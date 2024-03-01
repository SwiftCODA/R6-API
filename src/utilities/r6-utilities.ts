import config from '../configs/config.json'

/**
 * Creates a string following the URL-parameter format from a parameter object.
 * 
 * @param parameters HTTP paramaters as an object.
 * @returns HTTP parameters as a string.
 */
export function CreateParameterString(parameters: object) {
    let pairs = new Array

    for (const [key, value] of Object.entries(parameters)) {
        pairs.push(`${key}=${value}`)
    }

    return pairs.join('&')
}

/**
 * Creates a list (string) of all season codes for R6.
 * 
 * @returns Season codes in the format of Y1S1, separated by commas.
 */
export function AllSeasonCodes(): string {
    // The current season code defined by the config file.
    const current = config.current_season;

    // The list of season codes.
    let codes = [];

    let year = 1;
    let season = 1;

    while (codes[codes.length - 1] !== current) {
        codes.push(`Y${year}S${season}`)

        if (season < 4) { season++ }
        else { season = 1; year++ }
    }

    return codes.join(',');
}

/**
 * Returns a ratio between a numerator and denominator.
 * 
 * @param a The numerator (Eg. kills).
 * @param b The denominator (Eg. deaths).
 * @returns Ratio between parameters, rounded to 2 decimal places.
 */
export function Ratio(a: number, b: number): string {
    if (a != 0) {
        if (b != 0) {
            const n = Number(a / b).toFixed(2)
            return n != "NaN" ? n : "0.00"
        }
        else {
            const n = Number(a).toFixed(2)
            return n != "NaN" ? n : "0.00"
        }
    }
    else { return "0.00" }
}

/**
 * Returns a percent value of a numerator and denominator.
 * 
 * @param a The numerator (Eg. wins).
 * @param b The denominator (Eg. losses).
 * @returns Percent of numerator of both parameters summed, rounded to 2 decimal places.
 */
export function Percent(a: number, b: number): string {
    if (a != 0) {
        if (b != 0) {
            const n = Number(a / (a + b) * 100).toFixed(2)
            return n != "NaN" ? n + "%" : "0.00%"
        }
        else { return "100.00%" }
    }
    else { return "0.00%" }
}