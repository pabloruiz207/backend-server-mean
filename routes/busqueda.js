var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var ResponseBuilder = require('../models/responseBuilder');

// ===================================
// Busqueda por colección
// ===================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla;
    var promesa;
    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(regex);
            break;
        case 'medico':
            promesa = buscarMedicos(regex);
            break;
        case 'hospital':
            promesa = buscarHospitales(regex);
            break;
        default:
            var mensaje = 'Los tipos de búsqueda solo son: usuarios, médicos y hospitales';
            return ResponseBuilder.errorResponse(res, 400, mensaje, { message: 'Tipo de colección/tabla no válido' });
    }
    promesa.then(data => {
        return ResponseBuilder.baseResponseBusqueda(res, 200, true, data, tabla);
    });
});

// ===================================
// Búsqueda general
// ===================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([buscarHospitales(regex), buscarMedicos(regex), buscarUsuarios(regex)])
        .then(respuestas => {
            var contenido = {
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            };
            return ResponseBuilder.baseResponseGet(res, 200, true, contenido);
        });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex }]).exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;