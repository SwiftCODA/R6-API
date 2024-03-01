import { R6Rank, R6RawPlatform } from './enums'

export interface R6FullProfile {
    code: number,
    profiles?: Map<string, R6Profile>
    error?: string,
    message?: string
}

interface R6Profile {
    currentSeason: R6Season,
    level: number,
    lifetime: R6Lifetime | null,
    maxRank: R6Rank,
    modified: number,
    operators: R6Operators | null,
    platform: R6RawPlatform,
    profileId: string,
}

export interface R6Lifetime {
    casual: R6LifetimeStats,
    overall: R6LifetimeStats,
    ranked: R6LifetimeStats,
    unranked: R6LifetimeStats
}

interface R6LifetimeStats {
    aces: number,
    assists: number,
    clutches: number,
    deaths: number,
    headshots: number,
    kdRatio: string,
    kills: number,
    killTrades: number,
    losses: number,
    minutesPlayed: number,
    revives: number,
    teamKills: number,
    winPercent: string,
    wins: number
}

export interface R6Season {
    casual: R6SeasonCasualStats,
    ranked: R6SeasonRankedStats
}

interface R6SeasonCasualStats {
    abandons: number,
    deaths: number,
    kdRatio: string,
    kills: number,
    losses: number,
    winPercent: string,
    wins: number
}

interface R6SeasonRankedStats {
    abandons: number,
    championNumber: number,
    deaths: number,
    kdRatio: string,
    kills: number,
    losses: number,
    maxRank: R6Rank,
    maxRankPoints: number,
    nextRank: R6Rank,
    nextRankByMaxRank: R6Rank,
    nextRankRankPoints: number,
    previousRank: R6Rank,
    rank: R6Rank,
    rankPointProgress: number,
    rankPoints: number,
    winPercent: string,
    wins: number
}

export interface R6Operators {
    casual: R6OperatorsGamemode,
    overall: R6OperatorsGamemode,
    ranked: R6OperatorsGamemode,
    unranked: R6OperatorsGamemode,
    profileId?: string
}

interface R6OperatorsGamemode {
    attackers: Map<string, R6OperatorStats> | null,
    defenders: Map<string, R6OperatorStats> | null
}

interface R6OperatorStats {
    aces: number,
    clutches: number,
    deaths: number,
    kdRatio: string,
    kills: number,
    losses: number,
    minutesPlayed: number,
    operator: string,
    winPercent: string,
    wins: number
}

export interface R6User {
    username: string,
    platform: string,
    profileId: string,
    userId: string
}

export interface R6Level {
    level: number
    profileId: string
}