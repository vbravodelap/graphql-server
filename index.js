import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './data/schema';
import { resolvers } from './data/resolvers';

import jwt from 'jsonwebtoken';

const app = express();
const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: async({req}) => {
        // Obtener el token de app.js
        const token = req.headers['authorization'];

        if(token !=="null"){
            try {
                const usuarioActual = await jwt.verify(token, process.env.SECRETO)

                req.usuarioActual = usuarioActual;  

                return {
                    usuarioActual
                }

            }catch(err){

                console.log(err);

            }
        }

    }
});

server.applyMiddleware({app});

app.listen({port: 4001}, () => console.log(`El servidor se esta corriendo ${server.graphqlPath}`));
