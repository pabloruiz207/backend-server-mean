var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');
var ResponseBuilder = require('../models/responseBuilder');

// ===================================
// Obtener todos los usuarios
// ===================================
app.get('/', (req, res) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, resultado) => {
                if (err) {
                    return ResponseBuilder.errorResponse(res, 500, 'Error cargando usuarios', err);
                }
                return ResponseBuilder.baseResponse(res, 200, true, resultado);
            });
});

// ===================================
// Actualizar usuario
// ===================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 500, 'Error al buscar usuario', err);
        }
        if (!usuario) {
            var error = { messsage: 'No existe un usuario con ese ID' };
            return ResponseBuilder.errorResponse(res, 400, 'El usuario con el id ' + id + ' no existe', error);
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return ResponseBuilder.errorResponse(res, 400, 'Error al actualizar usuario', err);
            }
            usuarioGuardado.password = ':)';
            return ResponseBuilder.baseResponse(res, 200, true, usuarioGuardado);
        });
    });
});

// ===================================
// Crear nuevo usuario
// ===================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,

    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 400, 'Error al crear usuario', err);
        }
        return ResponseBuilder.baseResponse(res, 201, true, usuarioGuardado, req.usuario);
    });
});

// ===================================
// Borrar usuario
// ===================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 400, 'Error al borrar usuario', err);
        }
        if (!usuarioBorrado) {
            var error = { messsage: 'No existe un usuario con ese ID' };
            return ResponseBuilder.errorResponse(res, 400, 'El usuario con el id ' + id + ' no existe', error);
        }
        return ResponseBuilder.baseResponse(res, 200, true, usuarioBorrado);
    });
});

module.exports = app;