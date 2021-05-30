var express = require('express');
var app = express();
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');
var ResponseBuilder = require('../models/responseBuilder');

// ===================================
// Obtener todos los médicos
// ===================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, resultado) => {
                if (err) {
                    return ResponseBuilder.errorResponse(res, 500, 'Error cargando médicos', err);
                }
                Medico.count({}, (err, conteo) => {
                    return ResponseBuilder.baseResponseGet(res, 200, true, resultado, conteo);
                });
            });
});

// ===================================
// Actualizar médico
// ===================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 500, 'Error al buscar médico', err);
        }
        if (!medico) {
            var error = { messsage: 'No existe un médico con ese ID' };
            return ResponseBuilder.errorResponse(res, 400, 'El médico con el id ' + id + ' no existe', error);
        }
        medico.nombre = body.nombre;
        // medico.img = body.img;
        medico.hospital = body.hospital;
        hospital.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return ResponseBuilder.errorResponse(res, 400, 'Error al actualizar médico', err);
            }
            return ResponseBuilder.baseResponse(res, 200, true, medicoGuardado);
        });
    });
});

// ===================================
// Crear nuevo médico
// ===================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id,
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 400, 'Error al crear mpedico', err);
        }
        return ResponseBuilder.baseResponse(res, 201, true, medicoGuardado, req.usuario);
    });
});

// ===================================
// Borrar médico
// ===================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 400, 'Error al borrar médico', err);
        }
        if (!medicoBorrado) {
            var error = { messsage: 'No existe un médico con ese ID' };
            return ResponseBuilder.errorResponse(res, 400, 'El médico con el id ' + id + ' no existe', error);
        }
        return ResponseBuilder.baseResponse(res, 200, true, medicoBorrado);
    });
});

module.exports = app;