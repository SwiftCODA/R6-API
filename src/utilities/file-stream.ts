import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'



export async function SaveJSONToFile(path: string, json: object) {
    // Separate path and filename.
    let pathComponents = path.split('/')

    // Declare filename. 
    const fileName = pathComponents[pathComponents.length - 1]

    // Remove filename from full path.
    pathComponents.pop()

    // Convert path back to string.
    path = pathComponents.join('/')

    // Create file path if does not exist.
    if (!existsSync(`${path}`)) {
        await mkdir(path, { recursive: true })
    }

    // Write contents to file.
    await writeFile(`${path}/${fileName}`, JSON.stringify(json))
}