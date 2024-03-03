export interface UbiToken {
    ticket: string
    expiration: string
    sessionId: string
}

export interface R6UserResponse {
    profiles: R6UserData[]
}

interface R6UserData {
    nameOnPlatform: string
    profileId: string
    userId: string
    platformType: string
}

export interface R6LevelResponse {
    level: number
}

export interface R6OperatorsResponse {
    profileData: { [key: string]: R6OperatorsProfileData }
}

export interface R6OperatorsProfileData {
    platforms?: R6OperatorsPlatforms
}

interface R6OperatorsPlatforms {
    PC?: R6OperatorsPlatform
    PS4?: R6OperatorsPlatform
    XONE?: R6OperatorsPlatform
}

export interface R6OperatorsPlatform {
    gameModes?: R6OperatorsGamemodes
}

interface R6OperatorsGamemodes {
    all?: R6OperatorsGamemode
    casual?: R6OperatorsGamemode
    ranked?: R6OperatorsGamemode
    unranked?: R6OperatorsGamemode
}

interface R6OperatorsGamemode {
    teamRoles?: R6OperatorsTeamRoles
}

interface R6OperatorsTeamRoles {
    Attacker?: R6OperatorsTeamRole[]
    attacker?: R6OperatorsTeamRole[]
    Defender?: R6OperatorsTeamRole[]
    defender?: R6OperatorsTeamRole[]
}

export interface R6OperatorsTeamRole {
    statsDetail: string
    death: number
    kills: number
    minutesPlayed: number
    roundsLost: number
    roundsPlayed: number
    roundsWithAnAce: R6Float
    roundsWithClutch: R6Float
    roundsWon: number
}

interface R6Float {
    value: number
}

export interface R6LifetimeResponse {
    profileData: { [key: string]: R6LifetimeProfileData }
}

export interface R6LifetimeProfileData {
    platforms?: R6LifetimePlatforms
}

interface R6LifetimePlatforms {
    PC?: R6LifetimePlatform
    PS4?: R6LifetimePlatform
    XONE?: R6LifetimePlatform
}

export interface R6LifetimePlatform {
    gameModes?: R6LifetimeGamemodes
}

interface R6LifetimeGamemodes {
    all?: R6LifetimeGamemode
    casual?: R6LifetimeGamemode
    ranked?: R6LifetimeGamemode
    unranked?: R6LifetimeGamemode
}

export interface R6LifetimeGamemode {
    teamRoles?: R6LifetimeTeamRoles
}

interface R6LifetimeTeamRoles {
    all?: R6LifetimeTeamRole[]
}

interface R6LifetimeTeamRole {
    assists: number
    death: number
    headshots: number
    kills: number
    matchesLost: number
    matchesWon: number
    minutesPlayed: number
    roundsPlayed: number
    roundsWithAnAce: R6Float
    roundsWithClutch: R6Float
    revives: number
    teamKills: number
    trades: number
}

export interface R6SeasonResponse {
    platform_families_full_profiles?: R6SeasonPlatformFamily[]
}

interface R6SeasonPlatformFamily {
    platform_family: string
    board_ids_full_profiles?: R6SeasonBoard[]
}

interface R6SeasonBoard {
    board_id: string
    full_profiles?: R6SeasonFullProfile[]
}

interface R6SeasonFullProfile {
    profile: R6SeasonProfile
    season_statistics: R6SeasonStats
}

interface R6SeasonProfile {
    id: string
    rank: number
    max_rank: number
    rank_points: number
    max_rank_points: number
    top_rank_position: number
}

interface R6SeasonStats {
    kills: number
    deaths: number
    match_outcomes: R6SeasonStatsMatchOutcomes
}

interface R6SeasonStatsMatchOutcomes {
    abandons: number
    losses: number
    wins: number
}
