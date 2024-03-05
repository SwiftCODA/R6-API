import config from '../configs/config.json'
import { R6Platform, R6Rank } from './interfaces/enums'



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
    const current = config.current_season

    // The list of season codes.
    let codes = []

    let year = 1
    let season = 1

    while (codes[codes.length - 1] !== current) {
        codes.push(`Y${year}S${season}`)

        if (season < 4) { season++ }
        else { season = 1; year++ }
    }

    return codes.join(',')
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
            return n != 'NaN' ? n : '0.00'
        }
        else {
            const n = Number(a).toFixed(2)
            return n != 'NaN' ? n : '0.00'
        }
    }
    else { return '0.00' }
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
            return n != 'NaN' ? n + '%' : '0.00%'
        }
        else { return '100.00%' }
    }
    else { return '0.00%' }
}

/**
 * Returns a platform's family as a string.
 * 
 * @param platform The R6 platform. MUST NOT use `id`.
 * @returns Platform family of specified platform.
 */
export function PlatformFamily(platform: R6Platform): string {
    switch (platform) {
        case R6Platform.pc:         return 'pc'
        case R6Platform.psn:
        case R6Platform.xbox:       return 'console'
        default:                    throw 'Platform cannot be `id`.'
    }
}

/**
 * Converts rank as integer into R6Rank type.
 * 
 * @param rankInt The rank represented by an integer. Range from `0` to `36`.
 * @returns Rank as an R6Rank.
 */
export function RankFromInt(rankInt: number): R6Rank {
    switch (rankInt) {
        case 0:  return R6Rank.unranked
        case 1:  return R6Rank.copper5
        case 2:  return R6Rank.copper4
        case 3:  return R6Rank.copper3
        case 4:  return R6Rank.copper2
        case 5:  return R6Rank.copper1
        case 6:  return R6Rank.bronze5
        case 7:  return R6Rank.bronze4
        case 8:  return R6Rank.bronze3
        case 9:  return R6Rank.bronze2
        case 10: return R6Rank.bronze1
        case 11: return R6Rank.silver5
        case 12: return R6Rank.silver4
        case 13: return R6Rank.silver3
        case 14: return R6Rank.silver2
        case 15: return R6Rank.silver1
        case 16: return R6Rank.gold5
        case 17: return R6Rank.gold4
        case 18: return R6Rank.gold3
        case 19: return R6Rank.gold2
        case 20: return R6Rank.gold1
        case 21: return R6Rank.platinum5
        case 22: return R6Rank.platinum4
        case 23: return R6Rank.platinum3
        case 24: return R6Rank.platinum2
        case 25: return R6Rank.platinum1
        case 26: return R6Rank.emerald5
        case 27: return R6Rank.emerald4
        case 28: return R6Rank.emerald3
        case 29: return R6Rank.emerald2
        case 30: return R6Rank.emerald1
        case 31: return R6Rank.diamond5
        case 32: return R6Rank.diamond4
        case 33: return R6Rank.diamond3
        case 34: return R6Rank.diamond2
        case 35: return R6Rank.diamond1
        case 36: return R6Rank.champion
        default: return R6Rank.unranked
    }
}

/**
 * Converts current R6Rank into next R6Rank.
 * 
 * @param rank The rank represented as R6Rank.
 * @returns Next rank as an R6Rank.
 */
export function NextRankFromRank(rank: R6Rank): R6Rank {
    switch (rank) {
        case R6Rank.unranked:       return R6Rank.copper5
        case R6Rank.copper5:        return R6Rank.copper4
        case R6Rank.copper4:        return R6Rank.copper3
        case R6Rank.copper3:        return R6Rank.copper2
        case R6Rank.copper2:        return R6Rank.copper1
        case R6Rank.copper1:        return R6Rank.bronze5
        case R6Rank.bronze5:        return R6Rank.bronze4
        case R6Rank.bronze4:        return R6Rank.bronze3
        case R6Rank.bronze3:        return R6Rank.bronze2
        case R6Rank.bronze2:        return R6Rank.bronze1
        case R6Rank.bronze1:        return R6Rank.silver5
        case R6Rank.silver5:        return R6Rank.silver4
        case R6Rank.silver4:        return R6Rank.silver3
        case R6Rank.silver3:        return R6Rank.silver2
        case R6Rank.silver2:        return R6Rank.silver1
        case R6Rank.silver1:        return R6Rank.gold5
        case R6Rank.gold5:          return R6Rank.gold4
        case R6Rank.gold4:          return R6Rank.gold3
        case R6Rank.gold3:          return R6Rank.gold2
        case R6Rank.gold2:          return R6Rank.gold1
        case R6Rank.gold1:          return R6Rank.platinum5
        case R6Rank.platinum5:      return R6Rank.platinum4
        case R6Rank.platinum4:      return R6Rank.platinum3
        case R6Rank.platinum3:      return R6Rank.platinum2
        case R6Rank.platinum2:      return R6Rank.platinum1
        case R6Rank.platinum1:      return R6Rank.emerald5
        case R6Rank.emerald5:       return R6Rank.emerald4
        case R6Rank.emerald4:       return R6Rank.emerald3
        case R6Rank.emerald3:       return R6Rank.emerald2
        case R6Rank.emerald2:       return R6Rank.emerald1
        case R6Rank.emerald1:       return R6Rank.diamond5
        case R6Rank.diamond5:       return R6Rank.diamond4
        case R6Rank.diamond4:       return R6Rank.diamond3
        case R6Rank.diamond3:       return R6Rank.diamond2
        case R6Rank.diamond2:       return R6Rank.diamond1
        case R6Rank.diamond1:       return R6Rank.champion
        default:                    return rank
    }
}

/**
 * Converts current R6Rank into previous R6Rank.
 * 
 * @param rank The rank represented as R6Rank.
 * @returns Next rank as an R6Rank.
 */
export function PreviousRankFromRank(rank: R6Rank): R6Rank {
    switch (rank) {
        case R6Rank.copper5:        return R6Rank.unranked
        case R6Rank.copper4:        return R6Rank.copper5
        case R6Rank.copper3:        return R6Rank.copper4
        case R6Rank.copper2:        return R6Rank.copper3
        case R6Rank.copper1:        return R6Rank.copper2
        case R6Rank.bronze5:        return R6Rank.copper1
        case R6Rank.bronze4:        return R6Rank.bronze5
        case R6Rank.bronze3:        return R6Rank.bronze4
        case R6Rank.bronze2:        return R6Rank.bronze3
        case R6Rank.bronze1:        return R6Rank.bronze2
        case R6Rank.silver5:        return R6Rank.bronze1
        case R6Rank.silver4:        return R6Rank.silver5
        case R6Rank.silver3:        return R6Rank.silver4
        case R6Rank.silver2:        return R6Rank.silver3
        case R6Rank.silver1:        return R6Rank.silver2
        case R6Rank.gold5:          return R6Rank.silver1
        case R6Rank.gold4:          return R6Rank.gold5
        case R6Rank.gold3:          return R6Rank.gold4
        case R6Rank.gold2:          return R6Rank.gold3
        case R6Rank.gold1:          return R6Rank.gold2
        case R6Rank.platinum5:      return R6Rank.gold1
        case R6Rank.platinum4:      return R6Rank.platinum5
        case R6Rank.platinum3:      return R6Rank.platinum4
        case R6Rank.platinum2:      return R6Rank.platinum3
        case R6Rank.platinum1:      return R6Rank.platinum2
        case R6Rank.emerald5:       return R6Rank.platinum1
        case R6Rank.emerald4:       return R6Rank.emerald5
        case R6Rank.emerald3:       return R6Rank.emerald4
        case R6Rank.emerald2:       return R6Rank.emerald3
        case R6Rank.emerald1:       return R6Rank.emerald2
        case R6Rank.diamond5:       return R6Rank.emerald1
        case R6Rank.diamond4:       return R6Rank.diamond5
        case R6Rank.diamond3:       return R6Rank.diamond4
        case R6Rank.diamond2:       return R6Rank.diamond3
        case R6Rank.diamond1:       return R6Rank.diamond2
        case R6Rank.champion:       return R6Rank.diamond1
        default:                    return rank
    }
}

/**
 * Converts current RP into next rank's lowest RP.
 * 
 * @param rp Rank Point value.
 * @returns Next rank's lowest RP value.
 */
export function GetNextRankRankPoints(rp: number): number {
    if (rp < 1100) { return 1100 }
    else if (rp >= 1100 && rp < 1200) { return 1200 }
    else if (rp >= 1200 && rp < 1300) { return 1300 }
    else if (rp >= 1300 && rp < 1400) { return 1400 }
    else if (rp >= 1400 && rp < 1500) { return 1500 }
    else if (rp >= 1500 && rp < 1600) { return 1600 }
    else if (rp >= 1600 && rp < 1700) { return 1700 }
    else if (rp >= 1700 && rp < 1800) { return 1800 }
    else if (rp >= 1800 && rp < 1900) { return 1900 }
    else if (rp >= 1900 && rp < 2000) { return 2000 }
    else if (rp >= 2000 && rp < 2100) { return 2100 }
    else if (rp >= 2100 && rp < 2200) { return 2200 }
    else if (rp >= 2200 && rp < 2300) { return 2300 }
    else if (rp >= 2300 && rp < 2400) { return 2400 }
    else if (rp >= 2400 && rp < 2500) { return 2500 }
    else if (rp >= 2500 && rp < 2600) { return 2600 }
    else if (rp >= 2600 && rp < 2700) { return 2700 }
    else if (rp >= 2700 && rp < 2800) { return 2800 }
    else if (rp >= 2800 && rp < 2900) { return 2900 }
    else if (rp >= 2900 && rp < 3000) { return 3000 }
    else if (rp >= 3000 && rp < 3100) { return 3100 }
    else if (rp >= 3100 && rp < 3200) { return 3200 }
    else if (rp >= 3200 && rp < 3300) { return 3300 }
    else if (rp >= 3300 && rp < 3400) { return 3400 }
    else if (rp >= 3400 && rp < 3500) { return 3500 }
    else if (rp >= 3500 && rp < 3600) { return 3600 }
    else if (rp >= 3600 && rp < 3700) { return 3700 }
    else if (rp >= 3700 && rp < 3800) { return 3800 }
    else if (rp >= 3800 && rp < 3900) { return 3900 }
    else if (rp >= 3900 && rp < 4000) { return 4000 }
    else if (rp >= 4000 && rp < 4100) { return 4100 }
    else if (rp >= 4100 && rp < 4200) { return 4200 }
    else if (rp >= 4200 && rp < 4300) { return 4300 }
    else if (rp >= 4300 && rp < 4400) { return 4400 }
    else { return rp }
}

/**
 * Converts Rank Point value into a progressive representation between 0 and 1 to the next rank.
 * 
 * @param rp The Rank Point value. 
 * @returns Float of Rank Point progress from 0 to 1.
 */
export function RankPointProgress(rp: number): number {
    if (rp >= 4400) { return 1.00 }
    else { return (rp % 100) / 100 }
}