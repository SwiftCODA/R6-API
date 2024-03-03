//
// Express Libraries
//

// Function to instantiate Express router.
import Router from 'express'
import { r6_profiles } from './routes/r6/profiles'
import { _404 } from './routes/404'
// Instance of Express Router.
const router = Router()


//
// Middleware
//
/*
const Middleware = require('./middleware/middleware')


*/

// Full Profiles Endpoint
router.get(
    '/r6/profiles/:platform/:username',
    //Middleware.profileTimeout,
    //Middleware.authenticate,
    r6_profiles
)

// Basic Profiles Endpoint
/*router.get(
    '/r6/basic-profiles/:platform/:username', 
    Middleware.profileTimeout, 
    Middleware.authenticate, 
    r6_basic_profiles
)*/

// Page Not Found Endpoint
// (If adding more routes, ensure that this is the LAST one before the error handler.)
router.use('/', _404)

// Catches any surfaced errors.
//router.use(Middleware.error)



export default router