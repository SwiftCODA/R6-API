import { R6LifetimeStats, R6OperatorStats, R6OperatorsGamemode } from './interfaces/front_interfaces'
import { R6LifetimeGamemode, R6OperatorsTeamRole } from './interfaces/http_interfaces'
import { Percent, Ratio } from './r6-utilities'



/**
 * Default R6LifetimeStats object.
 */
export const DefaultR6LifetimesStats: R6LifetimeStats = {
    aces: 0,
    assists: 0,
    clutches: 0,
    deaths: 0,
    headshots: 0,
    kdRatio: '',
    kills: 0,
    killTrades: 0,
    losses: 0,
    minutesPlayed: 0,
    revives: 0,
    teamKills: 0,
    winPercent: '',
    wins: 0
}

/**
 * Merges a season's data (R6LifetimeGamemode object) into an copied R6LifetimeStats object,
 * then returns the merged copy.
 * 
 * @param existing Original R6LifetimeStats object to copy and merge into.
 * @param data New R6LifetimeGamemode object to merge.
 * @returns Merged R6LifetimeGamemode object.
 */
export function MergeR6LifetimeStats(existing: R6LifetimeStats, data: R6LifetimeGamemode | undefined): R6LifetimeStats {
    if (data && data.teamRoles && data.teamRoles.all) {
        data.teamRoles.all!.forEach(stats => {
            existing.aces += Math.round(stats.roundsWithAnAce.value * stats.roundsPlayed)
            existing.assists += stats.assists
            existing.clutches += Math.round(stats.roundsWithClutch.value * stats.roundsPlayed)
            existing.deaths += stats.death,
            existing.headshots += stats.headshots,
            existing.kills += stats.kills,
            existing.killTrades += stats.trades,
            existing.losses += stats.matchesLost,
            existing.minutesPlayed += stats.minutesPlayed,
            existing.revives += stats.revives,
            existing.teamKills += stats.teamKills,
            existing.wins += stats.matchesWon
        })  

        existing.kdRatio = Ratio(existing.kills, existing.deaths)
        existing.winPercent = Percent(existing.wins, existing.losses)
    }

    return existing
}

/**
 * Default R6OperatorsGamemode object.
 */
export const DefaultR6OperatorsGamemode: R6OperatorsGamemode = {
    attackers: {},
    defenders: {}
}

/**
 * Simplifies a single operator's data and returns an R6OperatorStats object.
 * 
 * @param operatorData Single operator's data.
 * @returns Simplified data of singular operator.
 */
export function SimplifiedR6OperatorStats(operatorData: R6OperatorsTeamRole): R6OperatorStats {
    const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
    const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)

    return {
        aces: aces,
        clutches: clutches,
        deaths: operatorData.death,
        kdRatio: Ratio(operatorData.kills, operatorData.death),
        kills: operatorData.kills,
        losses: operatorData.roundsLost,
        minutesPlayed: operatorData.minutesPlayed,
        operator: operatorData.statsDetail.toLowerCase(),
        winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
        wins: operatorData.roundsWon
    }
}