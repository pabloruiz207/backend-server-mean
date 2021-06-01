var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();
var Usuario = require('../models/usuario');
var ResponseBuilder = require('../models/responseBuilder');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ===================================
// Autenticación de Google
// ===================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
// verify().catch(console.error);

app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return ResponseBuilder.errorResponse(res, 400, 'Token no válido', e);
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 500, 'Error al buscar usuarios', err);
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return ResponseBuilder.errorResponse(res, 400, 'Debe de usar su autenticación normal');
            } else {
                var token = obtenerToken(usuarioDB);
                return ResponseBuilder.baseResponseLogin(res, 200, true, usuarioDB, token);
            }
        } else {
            // el usuario no existe, hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((err, usuarioGuardado) => {
                var token = obtenerToken(usuarioGuardado);
                return ResponseBuilder.baseResponseLogin(res, 200, true, usuarioGuardado, token);
            });
        }
    });
});

// ===================================
// Autenticación normal
// ===================================
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 500, 'Error al buscar usuarios', err);
        }
        if (!usuarioDB) {
            return ResponseBuilder.errorResponse(res, 400, 'Credenciales incorrectas - email', err);
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return ResponseBuilder.errorResponse(res, 400, 'Credenciales incorrectas - pasword', err);
        }
        // Crear token
        usuarioDB.password = ':)';
        var token = obtenerToken(usuarioDB);
        return ResponseBuilder.baseResponseLogin(res, 200, true, usuarioDB, token);
    });
});

function obtenerToken(usuarioDB) {
    return jwt.sign({ usuarioDB }, SEED, { expiresIn: 14400 });
}

module.exports = app;