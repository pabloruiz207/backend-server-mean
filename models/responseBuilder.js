function baseResponse(res, status, ok, contenido, usuarioToken) {
    return res.status(status).json({
        ok: ok,
        contenido: contenido,
        usuarioToken: usuarioToken
    });
}

function baseResponseLogin(res, status, ok, contenido, token) {
    return res.status(status).json({
        ok: ok,
        contenido: contenido,
        token: token
    });
}

function errorResponse(res, status, mensaje, err) {
    return res.status(status).json({
        ok: false,
        mensaje: mensaje,
        error: err
    });
}

module.exports.baseResponse = baseResponse;
module.exports.baseResponseLogin = baseResponseLogin;
module.exports.errorResponse = errorResponse;