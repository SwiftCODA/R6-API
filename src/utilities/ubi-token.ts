import { UbiAuthResponse } from './interfaces/http_interfaces';
import { readFile } from 'fs/promises'



export default async function Token(version: string): Promise<UbiAuthResponse | void> {
    try {
        const file = await readFile(`../../private/auth_token_${version}.json`, 'utf8')
        const token = JSON.parse(file) as UbiAuthResponse
        
        return token
    }
    catch (error) {
        console.log(error)
    }
}