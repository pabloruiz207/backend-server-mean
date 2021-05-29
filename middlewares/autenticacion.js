var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ===================================
// Verificar token
// ===================================
exports.verificarToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 401, 'Token incorrecto', err);
        }
        req.usuario = decoded.usuarioDB;
        next();
    });
}