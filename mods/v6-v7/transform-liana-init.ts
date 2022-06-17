import { API, CallExpression, Collection, FileInfo, JSCodeshift } from "jscodeshift";

function addLianaInitPropertyIfNotExist(j: JSCodeshift, lianaInit: Collection<CallExpression>, propertyName: string) {
  if (!lianaInit.find(j.Identifier, { name: propertyName }).length) {
    const identifier = j.identifier(propertyName);
    const objectMapingProp = j.objectProperty(identifier, identifier);
    objectMapingProp.shorthand = true;
    lianaInit.find(j.ObjectExpression).get('properties').push(objectMapingProp);
  }
}

export default function (fileInfo: FileInfo, api: API): string {
  const { j } = api;
  const root = j(fileInfo.source);
  
  const lianaInit = root.find(j.CallExpression, { callee: { object: { name: 'Liana' }, property: { name: 'init' }}})
  if (!lianaInit.length) return root.toSource();

  root.find(j.Identifier, { name: 'secretKey' }).replaceWith(j.identifier('envSecret'));
  root.find(j.Identifier, { name: 'authKey' }).replaceWith(j.identifier('authSecret'));
  root.find(j.Property, { key: { name: 'onlyCrudModule' }}).remove();
  root.find(j.Property, { key: { name: 'modelsDir' }}).remove();
  root.find(j.Property, { key: { name: 'sequelize' }}).remove();
  root.find(j.Property, { key: { name: 'mongoose' }}).remove();

  addLianaInitPropertyIfNotExist(j, lianaInit, 'objectMapping');
  addLianaInitPropertyIfNotExist(j, lianaInit, 'connections');

  //TODO add const { objectMapping, connections } = require('../models');

  return root.toSource();
}
