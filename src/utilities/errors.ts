import { R6FullProfile } from "./interfaces/front_interfaces";

export const internalError: R6FullProfile = {
    code: 500,
    error: 'Internal Server Error',
    message: 'An issue occurred on our end. Please contact the administrator.'
}

export const tooManyRequestsError: R6FullProfile = {
    code: 429,
    error: 'Too many requests',
    message: 'Too many requests. Slow down.'
}

export function notFoundError(path: string): R6FullProfile {
    return {
        code: 404,
        error: 'Not found',
        message: `${path} not found.`
    }
}