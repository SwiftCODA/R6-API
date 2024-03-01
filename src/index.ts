import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import router from './router'
import cluster from 'cluster'
import os from 'os'
import config from './configs/config.json'
import { R6Platform } from './utilities/interfaces/enums'

let x = 'id'
let y = x as R6Platform
console.log(y)

// Toggle debug mode.
if (!config.debug_mode) {
    console.log = () => {}
    console.error = () => {}
    console.debug = () => {}
    console.info = () => {}
    console.warn = () => {}
}


// Maximum of X requests per user per second.
const limiter = rateLimit({
    max: config.max_requests_per_user_per_second,
    windowMs: 1000,
    standardHeaders: false,
    legacyHeaders: false, 
    message: {
        code: 429,
        error: 'Too many requests',
        message: 'Too many requests. Slow down.'
    }
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
}
// If this cluster is not a primary cluster, create a worker on this CPU.
else {
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