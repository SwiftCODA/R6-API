import { R6Platform, R6RawPlatform, R6Region, UbiAppId } from "../utilities/interfaces/enums";
import { internalError } from "../utilities/errors";
import { R6FullProfile, R6Lifetime, R6Season, R6Operators, R6User, R6Level, R6SeasonRankedStats, R6SeasonCasualStats } from "../utilities/interfaces/front_interfaces";
import Token from "../utilities/ubi-token";
import config from '../configs/config.json'
import axios from "axios";
import { R6LevelResponse, R6OperatorsPlatform, R6OperatorsResponse, R6SeasonResponse, R6UserResponse, UbiToken } from "../utilities/interfaces/http_interfaces";
import { AllSeasonCodes, CreateParameterString, GetNextRankRankPoints, NextRankFromRank, Percent, PlatformFamily, PreviousRankFromRank, RankFromInt, RankPointProgress, Ratio } from "../utilities/r6-utilities";
import { DEFAULT_MAX_VERSION } from "tls";
import { secondsSinceEpoch } from "../utilities/timestamps";



// called by route
export async function RequestFullProfile(usernames: string, platform: R6Platform, region: R6Region): Promise<R6FullProfile> {
    const tokenV2 = await Token('v2')
    const tokenV3 = await Token('v3')

    if (!tokenV2 || !tokenV3) { return internalError }

    let fullProfiles: R6FullProfile
    
    let userDataPromise: Promise<R6User[] | void>
    let levelPromises: Promise<R6Level | void>[] = []
    let operatorsPromises: Promise<R6Operators | void>[] = []
    let lifetimePromises: Promise<R6Lifetime>[] // TODO
    let currentSeasonPromises: Promise<R6Season | void>[] = []

    let userData: R6User[] | void
    let levelData: (R6Level | void)[]
    let operatorsData: (R6Operators | void)[]
    let lifetimeData: R6Lifetime
    let currentSeasonData: (R6Season | void)[]

    let levelDataMap: Map<string, number> = new Map()
    let operatorsDataMap: Map<string, R6Operators> = new Map()
    let currentSeasonDataMap: Map<string, R6Season> = new Map()



    switch (platform) {
        case R6Platform.id:
            const ids = usernames
            userDataPromise = RequestR6UserById(ids, tokenV2)
            break
        default:
            userDataPromise = RequestR6UserByUsername(usernames, platform, tokenV2)
            break
    }
    


    userData = await userDataPromise
    
    if (!userData) { return internalError }
    else {
        userData.forEach(user => {
            let newPlatform: R6Platform

            switch (user.platform) {
                case 'uplay': newPlatform = R6Platform.pc; break
                case 'psn': newPlatform = R6Platform.psn; break
                case 'xbl': newPlatform = R6Platform.xbox; break
                default: return internalError
            }

            levelPromises.push(RequestR6Level(user.userId, user.profileId, tokenV3))
            operatorsPromises.push(RequestR6Operators(user.userId, user.profileId, newPlatform, tokenV2))
            currentSeasonPromises.push(RequestR6Season(user.userId, user.profileId, newPlatform, tokenV3))
        })
    }
    

    
    levelData = await Promise.all(levelPromises)
    operatorsData = await Promise.all(operatorsPromises)
    currentSeasonData = await Promise.all(currentSeasonPromises)



    fullProfiles = { code: 200, }
    fullProfiles.profiles = new Map()

    

    levelData.forEach(level => {
        if (level) {
            levelDataMap.set(level.profileId, level.level)
        }
    })

    operatorsData.forEach(operators => {
        if (operators) {
            operatorsDataMap.set(operators.profileId!, {
                casual: operators.casual,
                overall: operators.overall,
                ranked: operators.ranked,
                unranked: operators.unranked
            })
        }
    })

    currentSeasonData.forEach(currentSeason => {
        if (currentSeason) {
            currentSeasonDataMap.set(currentSeason.profileId!, {
                casual: currentSeason.casual,
                ranked: currentSeason.ranked
            })
        }
    })

    userData.forEach(user => {
        const profileId = user.profileId

        fullProfiles.profiles?.set(profileId, {
            currentSeason: currentSeasonDataMap.get(profileId)!,
            level: levelDataMap.get(profileId) || 0,
            lifetime: ,
            modified: secondsSinceEpoch(),
            operators: operatorsDataMap.get(profileId) || null,
            platform: user.platform as R6RawPlatform,
            profileId: user.profileId,
        })
    })

    return fullProfiles
}

async function RequestR6UserByUsername(usernames: string, platform: R6Platform, token: UbiToken): Promise<R6User[] | void> {
    const params = `nameOnPlatform=${usernames}&platformType=${platform}`
    return await RequestR6User(params, token)
}

async function RequestR6UserById(profileId: string, token: UbiToken): Promise<R6User[] | void> {
    const params = `profileId=${profileId}`
    return await RequestR6User(params, token)
}

// Only to be called by RequestR6UserByUsername || RequestR6UserById
async function RequestR6User(params: string, token: UbiToken): Promise<R6User[] | void> {
    const httpConfig = {
        method: 'GET',
        url: `https://api-ubiservices.ubi.com/v3/profiles?${params}`,
        headers: {
            'Authorization': `ubi_v1 t=${token.ticket}`,
            'Ubi-AppId': UbiAppId.v2,
            'User-Agent': config.http.user_agent,
            'Connection': 'Keep-Alive'
        }
    }

    try {
        const response = await axios(httpConfig)
        const data = response.data as Map<string, R6UserResponse>
        
        let parsed: R6User[] = []

        data.forEach((userData) => {
            parsed.push({
                username: userData.nameOnPlatform,
                profileId: userData.profileId,
                userId: userData.userId,
                platform: userData.platformType
            })
        })

        return parsed
    }
    catch (error) { console.log(error) }
}

// limit 1 player
async function RequestR6Level(userId: string, profileId: string, token: UbiToken): Promise<R6Level | void> {
    const httpConfig = {
        method: 'GET',
        url: `https://public-ubiservices.ubi.com/v1/spaces/0d2ae42d-4c27-4cb7-af6c-2099062302bb/title/r6s/rewards/public_profile?profile_id=${userId}`,
        headers: {
            'Authorization': `ubi_v1 t=${token.ticket}`,
            'Ubi-AppId': UbiAppId.v2,
            'Ubi-SessionId': token.sessionId,
            'User-Agent': config.http.user_agent,
            'Connection': 'Keep-Alive'
        }
    }

    try {
        const response = await axios(httpConfig)
        const data = response.data as R6LevelResponse

        const parsed: R6Level = {
            level: data.level,
            profileId: profileId
        }

        return parsed
    }
    catch (error) { console.log(error) }
}

// limit 1 player
async function RequestR6Operators(userId: string, profileId: string, platform: R6Platform, token: UbiToken): Promise<R6Operators | void> {
    let newPlatform: string

    switch (platform) {
        case R6Platform.pc: newPlatform = 'PC'; break
        case R6Platform.psn: newPlatform = 'PLAYSTATION'; break
        case R6Platform.xbox: newPlatform = 'XONE'; break
        default: return
    }
    
    const parameters = {
        spaceId: '05bfb3f7-6c21-4c42-be1f-97a33fb5cf66',
        gameMode: 'all,ranked,casual,unranked',
        view: 'seasonal',
        aggregation: 'operators',
        platform: platform,
        teamRole: 'Attacker,Defender',
        seasons: AllSeasonCodes()
    }
    
    const httpConfig = {
        method: 'GET',
        url: `https://prod.datadev.ubisoft.com/v1/users/${userId}/playerstats?${CreateParameterString(parameters)}`,
        headers: {
            'Authorization': `ubi_v1 t=${token.ticket}`,
            'Ubi-AppId': UbiAppId.v2,
            'Expiration': token.expiration,
            'Ubi-SessionId': token.sessionId,
            'User-Agent': config.http.user_agent,
            'Connection': 'Keep-Alive'
        }
    }

    try {
        const response = await axios(httpConfig)
        const data = response.data as R6OperatorsResponse

        let parsed: R6Operators = {
            casual: { attackers: null, defenders: null },
            overall: { attackers: null, defenders: null },
            ranked: { attackers: null, defenders: null },
            unranked: { attackers: null, defenders: null },
            profileId: profileId
        }

        data.profileData.forEach((profileData) => {
            let dataByPlatform: R6OperatorsPlatform | undefined

            switch (newPlatform) {
                case 'PC': dataByPlatform = profileData.platforms?.PC; break
                case 'PLAYSTATION': dataByPlatform = profileData.platforms?.PS4; break
                case 'XONE': dataByPlatform = profileData.platforms?.XONE; break
                default: return
            }

            if (!dataByPlatform || !dataByPlatform.gameModes) { return }
            else {
                const gameModes = dataByPlatform.gameModes
                
                if (gameModes.all) {
                    const all = gameModes.all

                    if (all.teamRoles) {
                        let attackers = all.teamRoles.attacker || all.teamRoles.Attacker
                        let defenders = all.teamRoles.defender || all.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.overall.attackers!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })

                        defenders?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.overall.defenders!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })
                    }
                }

                if (gameModes.casual) {
                    const casual = gameModes.casual

                    if (casual.teamRoles) {
                        let attackers = casual.teamRoles.attacker || casual.teamRoles.Attacker
                        let defenders = casual.teamRoles.defender || casual.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.casual.attackers!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })

                        defenders?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.casual.defenders!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })
                    }
                }

                if (gameModes.ranked) {
                    const ranked = gameModes.ranked

                    if (ranked.teamRoles) {
                        let attackers = ranked.teamRoles.attacker || ranked.teamRoles.Attacker
                        let defenders = ranked.teamRoles.defender || ranked.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.ranked.attackers!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })

                        defenders?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.ranked.defenders!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })
                    }
                }

                if (gameModes.unranked) {
                    const unranked = gameModes.unranked

                    if (unranked.teamRoles) {
                        let attackers = unranked.teamRoles.attacker || unranked.teamRoles.Attacker
                        let defenders = unranked.teamRoles.defender || unranked.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.unranked.attackers!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })

                        defenders?.forEach((operatorData) => {
                            const aces = Math.round(operatorData.roundsWithAnAce.value * operatorData.roundsPlayed)
                            const clutches = Math.round(operatorData.roundsWithClutch.value * operatorData.roundsPlayed)
                            
                            parsed.unranked.defenders!.set(operatorData.statsDetail, {
                                aces: aces,
                                clutches: clutches,
                                deaths: operatorData.death,
                                kdRatio: Ratio(operatorData.kills, operatorData.death),
                                kills: operatorData.kills,
                                losses: operatorData.roundsLost,
                                minutesPlayed: operatorData.minutesPlayed,
                                operator: operatorData.statsDetail,
                                winPercent: Percent(operatorData.roundsWon, operatorData.roundsLost),
                                wins: operatorData.roundsWon
                            })
                        })
                    }
                }
            }
        })

        return parsed
    }
    catch (error) { console.log(error) }    
}

// limit 1 player
async function RequestR6Season(userId: string, profileId: string, platform: R6Platform, token: UbiToken): Promise<R6Season | void> {
    const desiredPlatformFamily = PlatformFamily(platform)
    let newPlatform: string

    switch (platform) {
        case R6Platform.pc: newPlatform = 'PC'; break
        case R6Platform.psn: newPlatform = 'PLAYSTATION'; break
        case R6Platform.xbox: newPlatform = 'XONE'; break
        default: return
    }
    
    const parameters = {
        platform_families: 'pc,console',
        profile_ids: userId
    }
    
    const httpConfig = {
        method: 'GET',
        url: `https://public-ubiservices.ubi.com/v2/spaces/0d2ae42d-4c27-4cb7-af6c-2099062302bb/title/r6s/skill/full_profiles?${CreateParameterString(parameters)}`,
        headers: {
            'Authorization': `ubi_v1 t=${token.ticket}`,
            'Ubi-AppId': UbiAppId.v3,
            'Ubi-SessionId': token.sessionId,
            'User-Agent': config.http.user_agent,
            'Connection': 'Keep-Alive'
        }
    }

    try {
        const response = await axios(httpConfig)
        const data = response.data as R6SeasonResponse

        let parsed: R6Season
        let ranked: R6SeasonRankedStats | undefined
        let casual: R6SeasonCasualStats | undefined

        if (data.platform_families_full_profiles) {
            for (const platformFamilyData of data.platform_families_full_profiles) {
                // 'pc' || 'console', used to compare with desired platform
                const platformFamily = platformFamilyData.platform_family
                
                if (platformFamilyData.board_ids_full_profiles) {
                    for (const board of platformFamilyData.board_ids_full_profiles) {
                        // 'casual' || 'event' || 'warmup' || 'ranked'
                        const gameMode = board.board_id

                        if (board.full_profiles) {
                            for (const profile of board.full_profiles) {
                                const player = profile.profile
                                
                                const currentSeasonData = profile.season_statistics

                                if (platformFamily === desiredPlatformFamily) {
                                    const rank = RankFromInt(player.rank)
                                    const maxRank = RankFromInt(player.max_rank)
                                    const rankPoints = player.rank_points

                                    if (gameMode === 'ranked') {
                                        ranked = {
                                            abandons: currentSeasonData.match_outcomes.abandons,
                                            championNumber: player.top_rank_position,
                                            deaths: currentSeasonData.deaths,
                                            kdRatio: Ratio(currentSeasonData.kills, currentSeasonData.deaths),
                                            kills: currentSeasonData.kills,
                                            losses: currentSeasonData.match_outcomes.losses,
                                            maxRank: maxRank,
                                            maxRankPoints: player.max_rank_points,
                                            nextRank: NextRankFromRank(rank),
                                            nextRankByMaxRank: NextRankFromRank(maxRank),
                                            nextRankRankPoints: GetNextRankRankPoints(rankPoints),
                                            previousRank: PreviousRankFromRank(rank),
                                            rank: rank,
                                            rankPointProgress: RankPointProgress(rankPoints),
                                            rankPoints: player.rank_points,
                                            winPercent: Percent(currentSeasonData.match_outcomes.wins, currentSeasonData.match_outcomes.losses),
                                            wins: currentSeasonData.match_outcomes.losses
                                        }
                                    }
                                    else if (gameMode === 'casual') {
                                        casual = {
                                            abandons: currentSeasonData.match_outcomes.abandons,
                                            deaths: currentSeasonData.deaths,
                                            kdRatio: Ratio(currentSeasonData.kills, currentSeasonData.deaths),
                                            kills: currentSeasonData.kills,
                                            losses: currentSeasonData.match_outcomes.losses,
                                            winPercent: Percent(currentSeasonData.match_outcomes.wins, currentSeasonData.match_outcomes.losses),
                                            wins: currentSeasonData.match_outcomes.losses
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (casual && ranked) {
            return {
                casual: casual,
                ranked: ranked,
                profileId: profileId
            }
        }
        else { return }
    }
    catch (error) { console.log(error) }    
}