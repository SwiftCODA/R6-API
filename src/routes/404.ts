import { Request, Response } from 'express'
import { notFoundError } from '../utilities/errors'



/**
 * Handles HTTP requests made to non-existent paths.
 * 
 * @param {request} req Express request object.
 * @param {response} res Express response object with callback properties. 
 */
export function _404(req: Request, res: Response) {
    res.status(404).send(notFoundError(req.path))
}