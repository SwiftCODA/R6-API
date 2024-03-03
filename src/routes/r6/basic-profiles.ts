//
// Utility Functions
//

const { R6UsernameIsValid, GUIDIsValid } = require('../../utilities/validity')



/**
 * Handles HTTP requests made to
 *   /r6/basic-profiles/{PLATFORM}/{USERNAME}?region={REGION} and
 *   /r6/basic-profiles/id/{PROFILEID}?region={REGION} paths.
 * Makes necessary function calls to obtain all basic stats for the specified profiles.
 * Limit of 50 profiles.
 * 
 * @param {Request} req Express request object.
 * @param {Response} res Express response object with callback properties. 
 
function r6_basic_profiles(req, res) {
    // Can be `id`, `pc`, `psn`, `xbox`.
    const platform = req.params.platform.toLowerCase()

    // Can be 1-50 usernames or 1-50 profileIds.
    const username = req.params.username
    // Can be `ncsa`, `emea`, `apac`.
    const region = req.query.region

    // Determine if the URL parameters are valid.
    let isValid = true

    switch (platform) {
        case 'id':
            // Check if the profileId (labeled username) is a valid GUID.
            isValid = GUIDIsValid(username)
            break
        case 'pc':
        case 'psn':
        case 'xbox':
            // Check if the username is valid based on the platform.
            isValid = R6UsernameIsValid(username, platform)
            break
        default:
            res.status(400).send({
                code: 400,
                error: 'Bad Request',
                message: 'Incorrect URL path. Use /basic-profiles/{PC||PSN||XBOX}/{USERNAME} or /basic-profiles/id/{PROFILE_ID}',
            })
            return
    }

    if (isValid) {
        if (region !== undefined) {
            GetBasicProfile(username, platform, region).then(profileData => {
                res.status(200).send({
                    code: 200,
                    profiles: profileData
                })
            }).catch(error => {
                res.status(500).send({
                    code: 500,
                    error: 'Internal Server Error',
                    message: 'Something went wrong on our end. Please contact our support team if this error persists.'
                })
            })
        }
        else {
            res.status(400).send({
                code: 400,
                error: 'Bad Request',
                message: 'No region specified.'
            })
        }
    }
    else {
        // To go into 'message' property of the HTTP error object.
        let errorMessage = new String

        // Change error message depending on the platform.
        switch (platform) {
            case 'id':
                errorMessage = 'Profile ID(s) do not conform to the GUID format.'
                break
            case 'pc':
            case 'psn':
            case 'xbox':
                errorMessage = 'Username contains invalid characters.'
                break
            default:
                // Invalid platform specified.
                res.status(400).end()
        }

        res.status(400).send({
            code: 400,
            error: 'Bad Request',
            message: errorMessage
        })
    }
}




module.exports = {
    r6_basic_profiles
}*/