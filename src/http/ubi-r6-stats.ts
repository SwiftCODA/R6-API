import { R6Platform, R6RawPlatform, R6Region, UbiAppId } from '../utilities/interfaces/enums'
import { internalError } from '../utilities/errors'
import { R6FullProfile, R6Lifetime, R6Season, R6Operators, R6User, R6Level, R6SeasonRankedStats, R6SeasonCasualStats } from '../utilities/interfaces/front_interfaces'
import Token from '../utilities/ubi-token'
import config from '../configs/config.json'
import axios from 'axios'
import { R6LevelResponse, R6LifetimePlatform, R6LifetimeProfileData, R6LifetimeResponse, R6OperatorsPlatform, R6OperatorsProfileData, R6OperatorsResponse, R6SeasonResponse, R6UserResponse, UbiToken } from '../utilities/interfaces/http_interfaces'
import { AllSeasonCodes, CreateParameterString, GetNextRankRankPoints, NextRankFromRank, Percent, PlatformFamily, PreviousRankFromRank, RankFromInt, RankPointProgress, Ratio } from '../utilities/r6-utilities'
import { secondsSinceEpoch } from '../utilities/timestamps'
import { UbiAccountIds, UbiDataByUserId } from '../utilities/interfaces/simple'
import { DefaultR6LifetimesStats, DefaultR6OperatorsGamemode, MergeR6LifetimeStats, SimplifiedR6OperatorStats } from '../utilities/parsing-helpers'



/**
 * Called by /r6/profiles/:username/:platform route. Fetches locally stored Ubisoft auth tokens,
 * calls functions that make requests to all Ubisoft stats endpoints, sorts and returns combined data. 
 * 
 * @param usernames Username(s) or profile id(s) of R6 accounts, separated by commas.
 * @param platform Platform of R6 accounts (can be R6Platform.id if using profile ids instead of usernames).
 * @returns Complete R6FullProfile object.
 */
export async function RequestFullProfile(usernames: string, platform: R6Platform): Promise<R6FullProfile> {
    // Fetch the V2 and V3 tokens from local file.
    const tokenV2 = await Token('v2')
    const tokenV3 = await Token('v3')

    // If either the V2 or V3 token failed to be retrieved, throw error.
    if (!tokenV2 || !tokenV3) { return internalError }

    // Final object to be returned once all requests are completed.
    let fullProfiles: R6FullProfile

    // Map of objects of userId and profileId, keyed by the profileId's platform.
    // This is populated once the R6User response has been retrieved.
    let accountIdsByPlatform: Map<R6Platform, UbiAccountIds[]> = new Map()
    
    // API fetch requests as unresolved promises.
    let userDataPromise: Promise<R6User[] | void>
    let levelPromises: Promise<R6Level | void>[] = []
    let operatorsPromises: Promise<R6Operators | void>[] = []
    let lifetimePromises: Promise<R6Lifetime | void>[] = []
    let currentSeasonPromises: Promise<Map<string, R6Season> | void>[] = []

    // Responses as arrays where the profileId is stored as a property.
    let userData: R6User[] | void
    let levelData: (R6Level | void)[]
    let operatorsData: (R6Operators | void)[]
    let lifetimeData: (R6Lifetime | void)[]
    let currentSeasonData: (Map<string,R6Season> | void)[]

    // Responses mapped to profileIds.
    let levelDataMap: Map<string, number> = new Map()
    let operatorsDataMap: Map<string, R6Operators> = new Map()
    let lifetimeDataMap: Map<string, R6Lifetime> = new Map()
    let currentSeasonDataMap: Map<string, R6Season> = new Map()

    // Create request for basic user data like username, profileId, userId, platform.
    switch (platform) {
        case R6Platform.id:
            const ids = usernames
            userDataPromise = RequestR6UserById(ids, tokenV2)
            break
        default:
            userDataPromise = RequestR6UserByUsername(usernames, platform, tokenV2)
            break
    }
    
    // Fetch user data.
    userData = await userDataPromise
    
    // Create requests that are limited to 1 userId per.
    if (!userData) { return internalError }
    else {
        userData.forEach(user => {
            // Textual platform converted to R6Platform.
            let newPlatform: R6Platform

            // Convert textual platform to R6Platform.
            switch (user.platform) {
                case R6RawPlatform.uplay:   newPlatform = R6Platform.pc;    break
                case R6RawPlatform.psn:     newPlatform = R6Platform.psn;   break
                case R6RawPlatform.xbl:     newPlatform = R6Platform.xbox;  break
                default:        return internalError
            }
            
            // Push this user's userId to the list of all userIds in question:

            // Existing array of accountIds objects for this platform.
            let userIdsForThisPlatform = accountIdsByPlatform.get(newPlatform)

            // If no userIds have been saved under this platform yet...
            if (!userIdsForThisPlatform) {
                // Create new array under this platform.
                accountIdsByPlatform.set(newPlatform, [{
                    userId: user.userId,
                    profileId: user.profileId
                }])
            }
            else {
                // Push userId to list of userIds under this platform.
                userIdsForThisPlatform.push({
                    userId: user.userId,
                    profileId: user.profileId
                })

                accountIdsByPlatform.set(newPlatform, userIdsForThisPlatform)
            }   

            // Create request for this user's level data.
            levelPromises.push(RequestR6Level(user.userId, user.profileId, tokenV3))
            // Create request for this user's operator data.
            operatorsPromises.push(RequestR6Operators(user.userId, user.profileId, newPlatform, tokenV2))
            // Create request for this user's lifetime data.
            lifetimePromises.push(RequestR6Lifetime(user.userId, user.profileId, newPlatform, tokenV2))
        })
    }

    // Requests that can be made in batches of multiple userIds:
    accountIdsByPlatform.forEach((accountIds, platform) => {
        let userDataByUserId: Map<string,UbiDataByUserId> = new Map()

        accountIds.forEach(ubiAccountIds => {
            userDataByUserId.set(ubiAccountIds.userId, {
                platform: platform,
                profileId: ubiAccountIds.profileId
            })
        })

        // Create request for this platform's current season data.
        currentSeasonPromises.push(RequestR6Season(userDataByUserId, tokenV3))
    })
    
    // Fetch all level data, 1 request for each user.
    levelData = await Promise.all(levelPromises)
    // Fetch all operator data, 1 request for each user.
    operatorsData = await Promise.all(operatorsPromises)
    // Fetch all lifetime data, 1 request for each user.
    lifetimeData = await Promise.all(lifetimePromises)
    // Fetch all current season data, 1 request for each platform.
    currentSeasonData = await Promise.all(currentSeasonPromises)

    // Create new, empty R6FullProfile object.
    fullProfiles = { code: 200 }
    fullProfiles.profiles = {}

    // Sort level data into a map, keyed by profile ids.
    levelData.forEach(level => {
        if (level) {
            levelDataMap.set(level.profileId, level.level)
        }
        else {
            throw Error('No level data.')
        }
    })

    // Sort operator data into a map, keyed by profile ids.
    operatorsData.forEach(operators => {
        if (operators) {
            operatorsDataMap.set(operators.profileId!, {
                casual: operators.casual,
                overall: operators.overall,
                ranked: operators.ranked,
                unranked: operators.unranked
            })
        }
        else {
            throw Error('No operator data.')
        }
    })

    // Sort lifetime data into a map, keyed by profile ids.
    lifetimeData.forEach(lifetime => {
        if (lifetime) {
            lifetimeDataMap.set(lifetime.profileId!, {
                casual: lifetime.casual,
                overall: lifetime.overall,
                ranked: lifetime.ranked,
                unranked: lifetime.unranked
            })
        }
        else {
            throw Error('No lifetime data.')
        }
    })

    // Sort current season data into a map, keyed by profile ids.
    currentSeasonData.forEach(currentSeasonDataByPlatform => {
        if (currentSeasonDataByPlatform) {
            // Merge this platform's current season data into the complete set of current
            // season data for all platforms, keyed by unique profileIds.
            currentSeasonDataMap = new Map([...currentSeasonDataMap, ...currentSeasonDataByPlatform])
        }
        else {
            throw Error('No current season data.')
        }
    })

    // Combine all separate data into the single R6FullProfile object.
    userData.forEach(user => {
        const profileId = user.profileId

        fullProfiles.profiles![profileId] = {
            currentSeason: currentSeasonDataMap.get(profileId) || null,
            level: levelDataMap.get(profileId) || 0,
            lifetime: lifetimeDataMap.get(profileId) || null,
            modified: secondsSinceEpoch(),
            operators: operatorsDataMap.get(profileId) || null,
            platform: user.platform as R6RawPlatform,
            profileId: user.profileId,
        }
    })

    return fullProfiles
}

/**
 * Creates HTTP parameters for requesting core user data by username/platform, then
 * offloads work to RequestR6User().
 * Limit: 50 players.
 * Token Version: V2
 * 
 * @param usernames Username(s) of R6 accounts, separated by commas.
 * @param platform Platform of R6 accounts.
 * @param token V2 Ubisoft auth token.
 * @returns Array of R6Users.
 */
async function RequestR6UserByUsername(usernames: string, platform: R6Platform, token: UbiToken): Promise<R6User[] | void> {
    let rawPlatform: R6RawPlatform

    switch (platform) {
        case R6Platform.pc:     rawPlatform = R6RawPlatform.uplay;  break
        case R6Platform.psn:    rawPlatform = R6RawPlatform.psn;    break
        case R6Platform.xbox:   rawPlatform = R6RawPlatform.xbl;    break
        default:                throw Error('Bad platform specified.')
    }

    const params = `nameOnPlatform=${usernames}&platformType=${rawPlatform}`
    return await RequestR6User(params, token)
}

/**
 * Creates HTTP parameters for requesting core user data by profile id, then
 * offloads work to `RequestR6User()`.
 * Limit: 50 players.
 * Token Version: V2
 * 
 * @param usernames Profile id(s) of R6 accounts, separated by commas.
 * @param token V2 Ubisoft auth token.
 * @returns Array of R6Users.
 */
async function RequestR6UserById(profileId: string, token: UbiToken): Promise<R6User[] | void> {
    const params = `profileId=${profileId}`
    return await RequestR6User(params, token)
}

/**
 * Requests core user data from Ubiosft and returns a parsed version of it.
 * Limit: 50 players.
 * Token Version: V2
 * 
 * @param params HTTP parameters generated by `RequestR6UserByUsername()` or `RequestR6UserById`.
 * @param token V2 Ubisoft auth token.
 * @returns Array of R6Users.
 */
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
        const data = response.data as R6UserResponse
        
        let parsed: R6User[] = []

        data.profiles.forEach((userData) => {
            parsed.push({
                username: userData.nameOnPlatform,
                profileId: userData.profileId,
                userId: userData.userId,
                platform: userData.platformType
            })
        })

        return parsed
    }
    catch (error) { console.error(error) }
}

/**
 * Requests level data from Ubisoft and returns a parsed version of it.
 * Limit: 1 player.
 * Token Version: V3
 * 
 * @param userId User id of R6 account (NOT to be confused with profile id).
 * @param profileId Profile id of R6 account.
 * @param token V3 Ubisoft auth token.
 * @returns R6Level object.
 */
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
    catch (error) { console.error(error) }
}

/**
 * Requests operator data from Ubisoft and returns a parsed version of it.
 * Limit: 1 player.
 * Token Version: V2
 * 
 * @param userId User id of R6 account (NOT to be confused with profile id).
 * @param profileId Profile id of R6 account.
 * @param platform Platform of R6 account.
 * @param token V2 Ubisoft auth token.
 * @returns R6Operators object.
 */
async function RequestR6Operators(userId: string, profileId: string, platform: R6Platform, token: UbiToken): Promise<R6Operators | void> {
    let newPlatform: string

    switch (platform) {
        case R6Platform.pc:     newPlatform = 'PC';             break
        case R6Platform.psn:    newPlatform = 'PLAYSTATION';    break
        case R6Platform.xbox:   newPlatform = 'XONE';           break
        default:                throw Error('Bad platform specified.')
    }
    
    const parameters = {
        spaceId: '05bfb3f7-6c21-4c42-be1f-97a33fb5cf66',
        gameMode: 'all,ranked,casual,unranked',
        view: 'seasonal',
        aggregation: 'operators',
        platform: newPlatform,
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
            casual: DefaultR6OperatorsGamemode,
            overall: DefaultR6OperatorsGamemode,
            ranked: DefaultR6OperatorsGamemode,
            unranked: DefaultR6OperatorsGamemode,
            profileId: profileId
        }

        if (!data.profileData) {
            return parsed
        }

        const profileData = new Map<string,R6OperatorsProfileData>(Object.entries(data.profileData))

        profileData.forEach(profileData => {
            let dataByPlatform: R6OperatorsPlatform | undefined

            switch (newPlatform) {
                case 'PC':          dataByPlatform = profileData.platforms?.PC;     break
                case 'PLAYSTATION': dataByPlatform = profileData.platforms?.PS4;    break
                case 'XONE':        dataByPlatform = profileData.platforms?.XONE;   break
                default:            return
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
                            parsed.overall.attackers![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })

                        defenders?.forEach((operatorData) => {
                            parsed.overall.defenders![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })
                    }
                }

                if (gameModes.casual) {
                    const casual = gameModes.casual

                    if (casual.teamRoles) {
                        let attackers = casual.teamRoles.attacker || casual.teamRoles.Attacker
                        let defenders = casual.teamRoles.defender || casual.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            parsed.casual.attackers![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })

                        defenders?.forEach((operatorData) => {
                            parsed.casual.defenders![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })
                    }
                }

                if (gameModes.ranked) {
                    const ranked = gameModes.ranked

                    if (ranked.teamRoles) {
                        let attackers = ranked.teamRoles.attacker || ranked.teamRoles.Attacker
                        let defenders = ranked.teamRoles.defender || ranked.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            parsed.ranked.attackers![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })

                        defenders?.forEach((operatorData) => {
                            parsed.ranked.defenders![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })
                    }
                }

                if (gameModes.unranked) {
                    const unranked = gameModes.unranked

                    if (unranked.teamRoles) {
                        let attackers = unranked.teamRoles.attacker || unranked.teamRoles.Attacker
                        let defenders = unranked.teamRoles.defender || unranked.teamRoles.Defender
                        
                        attackers?.forEach((operatorData) => {
                            parsed.unranked.attackers![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })

                        defenders?.forEach((operatorData) => {
                            parsed.unranked.defenders![operatorData.statsDetail.toLowerCase()] = SimplifiedR6OperatorStats(operatorData)
                        })
                    }
                }
            }
        })

        return parsed
    }
    catch (error) { console.error(error) }    
}

/**
 * Requests lifetime data by gamemode from Ubisoft and returns a parsed version of it.
 * Limit: 1 player.
 * Token Version: V2
 * 
 * @param userId User id of R6 account (NOT to be confused with profile id).
 * @param profileId Profile id of R6 account.
 * @param platform Platform of R6 account.
 * @param token V2 Ubisoft auth token.
 * @returns R6Lifetime object.
 */
async function RequestR6Lifetime(userId: string, profileId: string, platform: R6Platform, token: UbiToken): Promise<R6Lifetime | void> {
    let newPlatform: string

    switch (platform) {
        case R6Platform.pc:     newPlatform = 'PC';             break
        case R6Platform.psn:    newPlatform = 'PLAYSTATION';    break
        case R6Platform.xbox:   newPlatform = 'XONE';           break
        default:                return
    }
    
    const parameters = {
        spaceId: '05bfb3f7-6c21-4c42-be1f-97a33fb5cf66',
        gameMode: 'all,ranked,casual,unranked',
        view: 'seasonal',
        aggregation: 'summary',
        platform: newPlatform,
        teamRole: 'all',
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
        const data = response.data as R6LifetimeResponse

        let parsed: R6Lifetime = {
            casual: DefaultR6LifetimesStats,
            overall: DefaultR6LifetimesStats,
            ranked: DefaultR6LifetimesStats,
            unranked: DefaultR6LifetimesStats,
            profileId: profileId
        }

        const profileData = new Map<string,R6LifetimeProfileData>(Object.entries(data.profileData))

        profileData.forEach(profileData => {
            let dataByPlatform: R6LifetimePlatform | undefined

            switch (newPlatform) {
                case 'PC':          dataByPlatform = profileData.platforms?.PC;     break
                case 'PLAYSTATION': dataByPlatform = profileData.platforms?.PS4;    break
                case 'XONE':        dataByPlatform = profileData.platforms?.XONE;   break
                default:            return
            }

            if (!dataByPlatform || !dataByPlatform.gameModes) { return }
            else {
                const gameModes = dataByPlatform.gameModes
                
                if (gameModes) {
                    parsed.casual = MergeR6LifetimeStats(parsed.casual, gameModes.casual)
                    parsed.overall = MergeR6LifetimeStats(parsed.overall, gameModes.all)
                    parsed.ranked = MergeR6LifetimeStats(parsed.ranked, gameModes.unranked)
                    parsed.unranked = MergeR6LifetimeStats(parsed.ranked, gameModes.unranked)
                }
            }
        })

        return parsed
    }
    catch (error) { console.error(error) }    
}

/**
 * Requests current season data from Ubisoft and returns a parsed version of it.
 * Limit: 50 players.
 * Token Version: V3
 * 
 * @param userDataByUserId Map of UbiDataByUserId objects keyed by R6 user ids.
 * @param token V3 Ubisoft auth token.
 * @returns Map of R6Seasons keyed by profile ids.
 */
async function RequestR6Season(userDataByUserId: Map<string, UbiDataByUserId>, token: UbiToken): Promise<Map<string, R6Season> | void> {
    const parameters = {
        platform_families: 'pc,console',
        profile_ids: Array.from(userDataByUserId.keys()).join(',')
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

        let parsed: Map<string, R6Season> = new Map()

        if (!data.platform_families_full_profiles) { return }
            else {
                for (const platformFamilyData of data.platform_families_full_profiles) {
                    // 'pc' || 'console', used to compare with desired platform
                    const platformFamily = platformFamilyData.platform_family
                    
                    if (!platformFamilyData.board_ids_full_profiles) { return } 
                    else {
                        for (const board of platformFamilyData.board_ids_full_profiles) {
                            // 'casual' || 'event' || 'warmup' || 'ranked'
                            const gameMode = board.board_id

                            if (!board.full_profiles) { return }
                            else {
                                for (const profile of board.full_profiles) {
                                    const player = profile.profile
                                    const userId = player.id

                                    const simpleUserData = userDataByUserId.get(userId)!

                                    const desiredPlatform = simpleUserData.platform
                                    const desiredPlatformFamily = PlatformFamily(desiredPlatform)

                                    const profileId = simpleUserData.profileId

                                    let ranked: R6SeasonRankedStats | undefined
                                    let casual: R6SeasonCasualStats | undefined
                                    
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

                                        parsed.set(profileId, {
                                            casual: casual!,
                                            ranked: ranked!
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }

        return parsed
    }
    catch (error) { console.error(error) }    
}