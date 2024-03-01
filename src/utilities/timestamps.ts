/**
 * @returns Seconds that have passed since Jan 1, 1970, 12:00am UTC.
 */
export function secondsSinceEpoch(): number {
    const date = new Date()
    return Math.round((date.getTime()) / 1000)
}