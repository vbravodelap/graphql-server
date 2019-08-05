'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeDefs = undefined;

var _graphqlImport = require('graphql-import');

var typeDefs = (0, _graphqlImport.importSchema)('data/schema.graphql');

exports.typeDefs = typeDefs;