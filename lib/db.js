'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Usuarios = exports.Pedidos = exports.Productos = exports.Clientes = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

_mongoose2.default.connect('mongodb://localhost/clientes', { useNewUrlParser: true });

_mongoose2.default.set('setFindAndModify', false);

// Definir schema de clientes
var clientesSchema = new _mongoose2.default.Schema({
    nombre: String,
    apellido: String,
    empresa: String,
    emails: Array,
    edad: Number,
    tipo: String,
    pedidos: Array
});
var Clientes = _mongoose2.default.model('clientes', clientesSchema);

// Productos
var productosSchema = new _mongoose2.default.Schema({
    nombre: String,
    precio: Number,
    stock: Number
});
var Productos = _mongoose2.default.model('productos', productosSchema);

var pedidosSchema = new _mongoose2.default.Schema({
    pedido: Array,
    total: Number,
    fecha: Date,
    cliente: _mongoose2.default.Types.ObjectId,
    estado: String
});
var Pedidos = _mongoose2.default.model('pedidos', pedidosSchema);

// Usuarios
var usuariosSchema = new _mongoose2.default.Schema({
    usuario: String,
    password: String
});

var Usuarios = _mongoose2.default.model('usuarios', usuariosSchema);

exports.Clientes = Clientes;
exports.Productos = Productos;
exports.Pedidos = Pedidos;
exports.Usuarios = Usuarios;