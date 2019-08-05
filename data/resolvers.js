import  { Clientes, Productos, Pedidos, Usuarios } from './db';
import { rejects } from 'assert';
import bcrypt from 'bcrypt';

// generar token
import dotenv from 'dotenv';
dotenv.config({path: 'variables.env'});
import jwt from 'jsonwebtoken';

const crearToken = (usuarioLogin, secreto, expiresIn) => {
    const { usuario } = usuarioLogin;
    
    return jwt.sign({usuario}, secreto, {expiresIn});
}

export const resolvers = {
    Query: {

        getClientes : (root, {limite, offset}) => {

            return Clientes.find({}).limit(limite).skip(offset)

        },
        getCliente : (root, {id}) => {
            return new Promise((resolve, object) => {
                Clientes.findById(id, (error, cliente) => {
                    if(error) rejects(error)
                    else resolve(cliente)
                });
            });
        },
        totalClientes : (root) => {
            return new Promise((resolve, rejects) => {
                Clientes.countDocuments({}, (error, count) =>{
                    if(error) rejects(error)
                    else resolve(count)
                });
            });
        },
        obtenerProductos : (root, {limite, offset, stock}) => {
            let filtro;
            if(stock) {
                filtro = {
                    stock: {$gt: 0}
                }
            }
            return Productos.find(filtro).limit(limite).skip(offset)
        },
        obtenerProducto : (root, {id}) => {
            return new Promise((resolve, rejects) => {
                Productos.findById(id, (error, producto) => {
                    if(error) rejects(error)
                    else resolve(producto)
                });
            })
        },

        totalProductos : (root) => {
            return new Promise((resolve, rejects) => {
                Productos.countDocuments({}, (error, count) =>{
                    if(error) rejects(error)
                    else resolve(count)
                });
            });
        },

        obtenerPedidos: (root, {cliente}) => {
            return new Promise((resolve, onject) => {
                Pedidos.find({cliente: cliente}, (error, pedido) => {
                    if(error) rejects(error)
                    else resolve(pedido)
                });
            });
        },

        topClientes: (root) => {
            return new Promise((resolve, object) => {
                Pedidos.aggregate([
                    {
                        $match: {
                            estado: "COMPLETADO"
                        }
                    },
                    
                    {
                        $group: {
                            _id: "$cliente",
                            total: { $sum: "$total" }
                        }
                    },
                    
                    {
                        $lookup : {
                            from: "clientes",
                            localField: '_id',
                            foreignField: '_id',
                            as: 'cliente'
                        }
                    },
                    
                    {
                        $sort: { total: -1 }
                    },
                    
                    {
                        $limit: 10
                    }
                ], (error, resultado) => {
                    if(error) rejects(error)
                    else resolve(resultado)
                })
            })
        },
        
        obtenerUsuario: (root, args, {usuarioActual}) => {

            if(!usuarioActual) {
                return null;
            }

            // Obtener usuario actual del token 
            const usuario = Usuarios.findOne({usuario: usuarioActual.usuario });

            return usuario;
            
        }

    },Mutation: {

        crearCliente : (root, {input}) => {
            
            const nuevoCliente = new Clientes({
                nombre: input.nombre,
                apellido: input.apellido,
                empresa: input.empresa,
                emails: input.emails,
                edad: input.edad,
                tipo: input.tipo,
                pedidos: input.pedidos
            });
            
            nuevoCliente.id = nuevoCliente._id;
            
            return new Promise((resolve, object) => {
                nuevoCliente.save((error) => {
                    if(error) rejects(error)
                    else resolve(nuevoCliente)
                })
            });



        },

        actualizarCliente: (root, {input}) => {
            
            return new Promise((resolve, object) => {
                Clientes.findOneAndUpdate({ _id : input.id}, input, {new: true}, (error, cliente) => {
                    if(error) rejects(error)
                    else resolve(cliente)
                });
            });

        },

        eliminarCliente: (root, {id}) => {

            return new Promise((resolve, object) => {
                Clientes.findOneAndDelete({_id : id }, (error) => {
                    if(error) rejects(error)
                    else resolve("Se elimino correctamente")
                });
            });

        },

        nuevoProducto: (root, {input}) => {

            const nuevoProducto = new Productos({
                nombre: input.nombre,
                precio: input.precio,
                stock: input.stock
            });

            nuevoProducto.id = nuevoProducto._id;

            return new Promise((resolve, object) => {
                nuevoProducto.save((error) => {
                    if(error) rejects(error)
                    else resolve(nuevoProducto)
                })
            });
        },

        actualizarProducto: (root, {input}) => {
            return new Promise((resolve, producto) => {
                Productos.findOneAndUpdate({_id : input.id }, input, {new: true}, (error, producto) =>{
                    if(error) rejects(error)
                    else resolve(producto)
                });
            })
        },
        
        eliminarProducto : (root, {id}) => {
            return new Promise((resolve, producto) =>{
                Productos.findOneAndDelete({_id: id}, (error) => {
                    if(error) rejects(error)
                    else resolve('Se ha eliminado correctamente')
                })
            })
        }, 

        nuevoPedido: (root, {input}) => {
            const nuevoPedido = new Pedidos({
                pedido: input.pedido,
                total: input.total,
                fecha: new Date(),
                cliente: input.cliente,
                estado: "PENDIENTE"
            });

            nuevoPedido.id = nuevoPedido._id;

            return new Promise((resolve, object) => {

                nuevoPedido.save((error) => {
                    if(error) rejects(error)
                    else resolve(nuevoPedido)
                })
            });
        },
        actualizarEstado: (root, {input}) => {
            return new Promise((resolve, object) => {

                // recorrer y actualizar el stock del producto/s en base al estado del producto

                const { estado } = input;

                let instruccion; 
                if(estado === 'COMPLETADO'){

                    instruccion = '-';

                } else if (estado === 'CANCELADO'){

                    instruccion = '+';

                }

                input.pedido.forEach(pedido => {
                    Productos.updateOne({ _id : pedido.id }, 
                        { "$inc":
                            { "stock": `${instruccion}${pedido.cantidad}` }
                        }, function(error) {
                            if(error) return new Error(error)
                        }

                    )
                });

                Pedidos.findOneAndUpdate({_id: input.id }, input, {new: true}, (error) => {
                    if(error) rejects(error);
                    else resolve('Se actualizo correctamente');
                })
            })
        },
    
        crearUsuario: async(root, {usuario, password}) => {

            // revisar si un usuario contiene ese password
            const existeUsuario = await Usuarios.findOne({usuario})

            if(existeUsuario) {
                throw new Error('El usuario ya existe');
            }
            
            const nuevoUsuario = await new Usuarios({
                usuario,
                password
            }).save();

            return "Creado correctamente"

        },
        autenticarUsuario: async(root, {usuario, password}) => {
            const nombreUsuario = await Usuarios.findOne({usuario});

            if(!nombreUsuario){
                throw new Error('Usuario no encontrado');
            }

            const passwordCorrecto = await bcrypt.compare(password, nombreUsuario.password)

            // si el password es incorrecto
            if(!passwordCorrecto) {
                throw new Error('Password incorrecto')
            } 

            return {
                token: crearToken(nombreUsuario, process.env.SECRETO, '1hr')
            }
        }

    }
}

export default resolvers;