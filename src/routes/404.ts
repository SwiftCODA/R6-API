//
// Config Files
//

const config = require('../configs/config.json')




/**
 * Handles HTTP requests made to non-existent paths.
 * 
 * @param {request} req Express request object.
 * @param {response} res Express response object with callback properties. 
 */
function _404(req, res) {
    res.status(404).send({
        code: 404,
        error: 'Not Found',
        message: `${req.path} not found.`,
    })
}




module.exports = {
    _404
}