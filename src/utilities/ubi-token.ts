import { UbiToken } from './interfaces/http_interfaces';
import { readFile } from 'fs/promises'
const x = require('../../private/auth_token_v2.json')


export default async function Token(version: string): Promise<UbiToken | void> {
    try {
        const file = await readFile(`private/auth_token_${version}.json`, 'utf8')
        const token = JSON.parse(file) as UbiToken
        
        return token
    }
    catch (error) {
        console.log(error)
    }
}