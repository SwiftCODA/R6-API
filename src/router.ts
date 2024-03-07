import { Router } from 'express'
import { r6_profiles } from './routes/r6/profiles'
import { _404 } from './routes/404'
import { Middleware } from './middleware/middleware'



// Instance of Express Router.
const router = Router()



// Full Profiles Endpoint.
router.get(
    '/r6/profiles/:platform/:username',
    r6_profiles
)

// Page Not Found Endpoint.
// (If adding more routes, ensure that this is the LAST one before the error handler.)
router.use(
    '/', 
    _404
)

// Catches any surfaced errors.
router.use(Middleware.error)



export default router