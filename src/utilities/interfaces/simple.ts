import { R6Platform } from "./enums"

export interface UbiAccountIds {
    userId: string,
    profileId: string
}

export interface UbiDataByUserId {
    platform: R6Platform,
    profileId: string
}