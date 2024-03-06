import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import router from './router'
import cluster from 'cluster'
import os from 'os'
import config from './configs/config.json'
import { tooManyRequestsError } from './utilities/errors'
import { UbiLoginManager } from './http/ubi-auth'
import ScheduleLogin from './utilities/cron'



// Toggle debug mode.
if (!config.debug_mode) {
    console.log = () => {}
    console.error = () => {}
    console.debug = () => {}
    console.info = () => {}
    console.warn = () => {}
}

// Create class singletons.
UbiLoginManager.instance = new UbiLoginManager

// Maximum of X requests per user per second.
const limiter = rateLimit({
    max: config.max_requests_per_user_per_second,
    windowMs: 1000,
    standardHeaders: false,
    legacyHeaders: false, 
    message: tooManyRequestsError
})

// If this cluster is the primary cluster, create a worker on all other CPUs.
if (cluster.isPrimary) {
    const numberOfCPUs = os.cpus().length

    console.log(`Cluster: Forking ${numberOfCPUs} workers.`)

    // Fork workers on each CPU.
    for (let i = 0; i < numberOfCPUs; i++) {
        cluster.fork()
    }

    // Handle worker crashing.
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork()
    })

    // Perform initialization tasks exactly once.
    UbiLoginManager.instance.Login()

    // Schedule cron tasks.
    ScheduleLogin()
}
// If this cluster is not a primary cluster, create a worker on this CPU.
else {
    console.log('Cluster: Created worker.')
    
    // Create Express instance on this CPU.
    const app = express()

    // Enable Helmet security.
    app.use(helmet())
    // Enable rate limiter.
    app.use(limiter)
    // Enable handling of all requests via the router.js file.
    app.use('/', router)

    // Run Express server and listen on port.
    app.listen(config.port)
}