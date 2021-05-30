var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();
var ResponseBuilder = require('../models/responseBuilder');
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    var mensaje = '';
    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        mensaje = 'Tipo de colección no válida';
        return ResponseBuilder.errorResponse(res, 400, mensaje, { message: 'Los tipos válidos son ' + tiposValidos.join(', ') });
    }
    if (!req.files) {
        return ResponseBuilder.errorResponse(res, 400, 'No seleccionó nada', { message: 'Debe seleciconar imagen' });
    }
    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    // Extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        mensaje = 'Extensión no válida';
        return ResponseBuilder.errorResponse(res, 400, mensaje, { message: 'las extensiones válidas son ' + extensionesValidas.join(', ') });
    }
    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo }`;
    // Mover archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return ResponseBuilder.errorResponse(res, 500, 'Error al mover archivo', err);
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    var modelo;
    switch (tipo) {
        case 'usuarios':
            modelo = Usuario;
            break;
        case 'hospitales':
            modelo = Hospital;
            break;
        case 'medicos':
            modelo = Medico;
            break;
    }

    modelo.findById(id, (err, respuesta) => {
        if (!respuesta) {
            return ResponseBuilder.errorResponse(res, 500, 'No existen ' + tipo + ' con el id ' + id);
        }
        var pathViejo = './uploads/' + tipo + '/' + respuesta.img;
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, (err) => {
                if (err) {
                    return ResponseBuilder.errorResponse(res, 500, 'Error al borrar archivo', err);
                }
            });
        }
        respuesta.img = nombreArchivo;
        respuesta.save((err, usuarioActualizado) => {
            return ResponseBuilder.baseResponseImagen(res, 200, true, usuarioActualizado);
        });
    });
}

module.exports = app;