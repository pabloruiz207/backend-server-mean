var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var Usuario = require('../models/usuario');
var ResponseBuilder = require('../models/responseBuilder');

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
        var token = jwt.sign({ usuarioDB }, seed, { expiresIn: 14400 });

        return ResponseBuilder.baseResponseLogin(res, 200, true, usuarioDB, token);
    });
});

module.exports = app;