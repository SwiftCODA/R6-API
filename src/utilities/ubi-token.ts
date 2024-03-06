import { UbiToken } from './interfaces/http_interfaces'
import { readFile } from 'fs/promises'



/**
 * Reads local file of cached Ubisoft auth token and returns a UbiToken
 * object of it.
 * 
 * @param version Ubisoft auth token version (`'v2'` || `'v3'`).
 * @returns Ubisoft auth token of corresponding version.
 */
export default async function Token(version: string): Promise<UbiToken | void> {
    try {
        const file = await readFile(`private/auth_token_${version}.json`, 'utf8')
        const token = JSON.parse(file) as UbiToken
        
        return token
    }
    catch (error) {
        console.error(error)
    }
}