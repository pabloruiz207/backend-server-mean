function baseResponse(res, status, ok, contenido, usuarioToken) {
    return res.status(status).json({
        ok: ok,
        contenido: contenido,
        usuarioToken: usuarioToken
    });
}

function baseResponseGet(res, status, ok, contenido, conteo) {
    return res.status(status).json({
        ok: ok,
        total: conteo,
        contenido: contenido
    });
}

function baseResponseImagen(res, status, ok, contenido) {
    return res.status(status).json({
        ok: ok,
        mensaje: 'imagen de usuario actualizaaa',
        contenido: contenido
    });
}

function baseResponseBusqueda(res, status, ok, contenido, tabla) {
    return res.status(status).json({
        ok: ok,
        tabla: tabla,
        // [tabla]: tabla -> forma dinamica de cambiar atributo
        contenido: contenido
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
module.exports.baseResponseGet = baseResponseGet;
module.exports.baseResponseBusqueda = baseResponseBusqueda;
module.exports.baseResponseImagen = baseResponseImagen;
module.exports.baseResponseLogin = baseResponseLogin;
module.exports.errorResponse = errorResponse;