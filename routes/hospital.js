var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');
var ResponseBuilder = require('../models/responseBuilder');

// ===================================
// Obtener todos los hospitales
// ===================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, resultado) => {
            if (err) {
                return ResponseBuilder.errorResponse(res, 500, 'Error cargando hospitales', err);
            }
            Hospital.count({}, (err, conteo) => {
                return ResponseBuilder.baseResponseGet(res, 200, true, resultado, conteo);
            });
        });
});

// ===================================
// Actualizar hospital
// ===================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 500, 'Error al buscar hospital', err);
        }
        if (!hospital) {
            var error = { messsage: 'No existe un hospital con ese ID' };
            return ResponseBuilder.errorResponse(res, 400, 'El hospital con el id ' + id + ' no existe', error);
        }
        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return ResponseBuilder.errorResponse(res, 400, 'Error al actualizar hospital', err);
            }
            return ResponseBuilder.baseResponse(res, 200, true, hospitalGuardado);
        });
    });
});

// ===================================
// Crear nuevo hospital
// ===================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario._id,
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 400, 'Error al crear hospital', err);
        }
        return ResponseBuilder.baseResponse(res, 201, true, hospitalGuardado, req.usuario);
    });
});

// ===================================
// Borrar hospital
// ===================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 400, 'Error al borrar hospital', err);
        }
        if (!hospitalBorrado) {
            var error = { messsage: 'No existe un hospital con ese ID' };
            return ResponseBuilder.errorResponse(res, 400, 'El hospital con el id ' + id + ' no existe', error);
        }
        return ResponseBuilder.baseResponse(res, 200, true, hospitalBorrado);
    });
});

module.exports = app;