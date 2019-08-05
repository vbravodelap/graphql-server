'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolvers = undefined;

var _db = require('./db');

var _assert = require('assert');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var resolvers = exports.resolvers = {
    Query: {

        getClientes: function getClientes(root, _ref) {
            var limite = _ref.limite,
                offset = _ref.offset;


            return _db.Clientes.find({}).limit(limite).skip(offset);
        },
        getCliente: function getCliente(root, _ref2) {
            var id = _ref2.id;

            return new Promise(function (resolve, object) {
                _db.Clientes.findById(id, function (error, cliente) {
                    if (error) (0, _assert.rejects)(error);else resolve(cliente);
                });
            });
        },
        totalClientes: function totalClientes(root) {
            return new Promise(function (resolve, rejects) {
                _db.Clientes.countDocuments({}, function (error, count) {
                    if (error) rejects(error);else resolve(count);
                });
            });
        },
        obtenerProductos: function obtenerProductos(root, _ref3) {
            var limite = _ref3.limite,
                offset = _ref3.offset,
                stock = _ref3.stock;

            var filtro = void 0;
            if (stock) {
                filtro = {
                    stock: { $gt: 0 }
                };
            }
            return _db.Productos.find(filtro).limit(limite).skip(offset);
        },
        obtenerProducto: function obtenerProducto(root, _ref4) {
            var id = _ref4.id;

            return new Promise(function (resolve, rejects) {
                _db.Productos.findById(id, function (error, producto) {
                    if (error) rejects(error);else resolve(producto);
                });
            });
        },

        totalProductos: function totalProductos(root) {
            return new Promise(function (resolve, rejects) {
                _db.Productos.countDocuments({}, function (error, count) {
                    if (error) rejects(error);else resolve(count);
                });
            });
        },

        obtenerPedidos: function obtenerPedidos(root, _ref5) {
            var cliente = _ref5.cliente;

            return new Promise(function (resolve, onject) {
                _db.Pedidos.find({ cliente: cliente }, function (error, pedido) {
                    if (error) (0, _assert.rejects)(error);else resolve(pedido);
                });
            });
        },

        topClientes: function topClientes(root) {
            return new Promise(function (resolve, object) {
                _db.Pedidos.aggregate([{
                    $match: {
                        estado: "COMPLETADO"
                    }
                }, {
                    $group: {
                        _id: "$cliente",
                        total: { $sum: "$total" }
                    }
                }, {
                    $lookup: {
                        from: "clientes",
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cliente'
                    }
                }, {
                    $sort: { total: -1 }
                }, {
                    $limit: 10
                }], function (error, resultado) {
                    if (error) (0, _assert.rejects)(error);else resolve(resultado);
                });
            });
        }

    }, Mutation: {

        crearCliente: function crearCliente(root, _ref6) {
            var input = _ref6.input;


            var nuevoCliente = new _db.Clientes({
                nombre: input.nombre,
                apellido: input.apellido,
                empresa: input.empresa,
                emails: input.emails,
                edad: input.edad,
                tipo: input.tipo,
                pedidos: input.pedidos
            });

            nuevoCliente.id = nuevoCliente._id;

            return new Promise(function (resolve, object) {
                nuevoCliente.save(function (error) {
                    if (error) (0, _assert.rejects)(error);else resolve(nuevoCliente);
                });
            });
        },

        actualizarCliente: function actualizarCliente(root, _ref7) {
            var input = _ref7.input;


            return new Promise(function (resolve, object) {
                _db.Clientes.findOneAndUpdate({ _id: input.id }, input, { new: true }, function (error, cliente) {
                    if (error) (0, _assert.rejects)(error);else resolve(cliente);
                });
            });
        },

        eliminarCliente: function eliminarCliente(root, _ref8) {
            var id = _ref8.id;


            return new Promise(function (resolve, object) {
                _db.Clientes.findOneAndDelete({ _id: id }, function (error) {
                    if (error) (0, _assert.rejects)(error);else resolve("Se elimino correctamente");
                });
            });
        },

        nuevoProducto: function nuevoProducto(root, _ref9) {
            var input = _ref9.input;


            var nuevoProducto = new _db.Productos({
                nombre: input.nombre,
                precio: input.precio,
                stock: input.stock
            });

            nuevoProducto.id = nuevoProducto._id;

            return new Promise(function (resolve, object) {
                nuevoProducto.save(function (error) {
                    if (error) (0, _assert.rejects)(error);else resolve(nuevoProducto);
                });
            });
        },

        actualizarProducto: function actualizarProducto(root, _ref10) {
            var input = _ref10.input;

            return new Promise(function (resolve, producto) {
                _db.Productos.findOneAndUpdate({ _id: input.id }, input, { new: true }, function (error, producto) {
                    if (error) (0, _assert.rejects)(error);else resolve(producto);
                });
            });
        },

        eliminarProducto: function eliminarProducto(root, _ref11) {
            var id = _ref11.id;

            return new Promise(function (resolve, producto) {
                _db.Productos.findOneAndDelete({ _id: id }, function (error) {
                    if (error) (0, _assert.rejects)(error);else resolve('Se ha eliminado correctamente');
                });
            });
        },

        nuevoPedido: function nuevoPedido(root, _ref12) {
            var input = _ref12.input;

            var nuevoPedido = new _db.Pedidos({
                pedido: input.pedido,
                total: input.total,
                fecha: new Date(),
                cliente: input.cliente,
                estado: "PENDIENTE"
            });

            nuevoPedido.id = nuevoPedido._id;

            return new Promise(function (resolve, object) {

                nuevoPedido.save(function (error) {
                    if (error) (0, _assert.rejects)(error);else resolve(nuevoPedido);
                });
            });
        },
        actualizarEstado: function actualizarEstado(root, _ref13) {
            var input = _ref13.input;

            return new Promise(function (resolve, object) {

                // recorrer y actualizar el stock del producto/s en base al estado del producto

                var estado = input.estado;


                var instruccion = void 0;
                if (estado === 'COMPLETADO') {

                    instruccion = '-';
                } else if (estado === 'CANCELADO') {

                    instruccion = '+';
                }

                input.pedido.forEach(function (pedido) {
                    _db.Productos.updateOne({ _id: pedido.id }, { "$inc": { "stock": '' + instruccion + pedido.cantidad }
                    }, function (error) {
                        if (error) return new Error(error);
                    });
                });

                _db.Pedidos.findOneAndUpdate({ _id: input.id }, input, { new: true }, function (error) {
                    if (error) (0, _assert.rejects)(error);else resolve('Se actualizo correctamente');
                });
            });
        },

        crearUsuario: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(root, _ref15) {
                var usuario = _ref15.usuario,
                    password = _ref15.password;
                var existeUsuario, nuevoUsuario;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return _db.Usuarios.findOne({ usuario: usuario });

                            case 2:
                                existeUsuario = _context.sent;

                                if (!existeUsuario) {
                                    _context.next = 5;
                                    break;
                                }

                                throw new Error('El usuario ya existe');

                            case 5:
                                _context.next = 7;
                                return new _db.Usuarios({
                                    usuario: usuario,
                                    password: password
                                }).save();

                            case 7:
                                nuevoUsuario = _context.sent;
                                return _context.abrupt('return', "Creado correctamente");

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, undefined);
            }));

            return function crearUsuario(_x, _x2) {
                return _ref14.apply(this, arguments);
            };
        }()

    }
};

exports.default = resolvers;