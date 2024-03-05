import { R6Platform } from './interfaces/enums'



/**
 * Determines whether an R6 username is valid depending on the specified platform.
 * 
 * @param username The username of the profile (No limit - separated by commas).
 * @param platform The platform of account(s) (`id`, `pc`, `psn`, `xbox`) (Limit 1).
 * @returns Whether the username is valid.
 */
export function R6UsernameIsValid(username: string, platform: R6Platform) {
    let regexp: string

    switch (platform) {
        // a-f, A-F, 0-9, -, ,
        case R6Platform.id: regexp = '^[a-fA-F0-9-,]*$'; break
        // a-z, A-Z, 0-9, -, _, .
        case R6Platform.pc: regexp = '^[a-zA-Z0-9-_.,]*$'; break
        // a-z, A-Z, 0-9, -, _
        case R6Platform.psn: regexp = '^[a-zA-Z0-9-_,]*$'; break
        // a-z, A-Z, 0-9, -, _, ,
        case R6Platform.xbox: regexp = '^[a-zA-Z0-9-_, ]*$'; break
    }
    
    return !(username.search(regexp) === -1)
}

/**
 * Determines whether a GUID is valid.
 * 
 * @param guids The profileIds (No limit - separated by commas).
 * @returns Whether the profileId is valid.
 */
export function GUIDIsValid(guids: string): boolean {
    const ids = guids.split(',')
    const regexp = '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'

    let isValid = true

    for (const id of ids) {
        if (id.search(regexp) === -1) {
            isValid = false
        }
    }

    return isValid
}