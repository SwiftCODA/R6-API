import { Request, Response } from 'express'
import { randomUUID } from 'crypto'



export class Middleware {
    /**
     * Middleware to handle any uncaught errors that surface to the router level and return a 500 error.
     *
     * @param err An uncaught error.
     * @param req Express request object.
     * @param res Express response object.
     * @param next Function to go to the next middleware.
     */
    static error = (err: Error, req: Request, res: Response, next: Function) => {
        // Generate a unique errorId.
        const errorId = randomUUID()

        // Log the error.
        console.error({
            errorId,
            error: err,
        });

        // Send the unknown error as an API response.
        res.status(500).send({
            code: 500,
            error: 'Internal Server Error',
            message: `Something went wrong on our end. Please contact our support team if this error persists. Error ID: ${errorId}`
        }).end()
    }
}