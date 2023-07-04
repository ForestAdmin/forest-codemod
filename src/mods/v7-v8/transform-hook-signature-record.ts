import {
  API,
  ArrowFunctionExpression,
  BlockStatement,
  Collection,
  FileInfo,
  Identifier,
  JSCodeshift,
  ObjectPattern,
  ObjectProperty,
  Program,
  Property,
} from 'jscodeshift';

function hasRecordFromRequestFunction(programBody: Program['body']): boolean {
  return programBody.some(exp => exp.type === 'FunctionDeclaration' && exp.id.name === 'getRecordFromRequest');
}

function getRecordFromRequestFunction(j: JSCodeshift, modelName: string) {
  return j.template.statement`
    async function getRecordFromRequest(request) {
      const [id] = request.body.data.attributes.ids;
          
      return ${modelName}.findByPk(id);
    }
  `;
}

function getModelImport(j: JSCodeshift, modelImportProperty: ObjectProperty) {
  return j.variableDeclaration(
    'const',
    [j.variableDeclarator(
      j.objectPattern([modelImportProperty]),
      j.template.expression`require('../models');`,
    )],
  );
}

function replaceRecordArgs(j: JSCodeshift, hooksUsingRecord: Collection<ArrowFunctionExpression>) {
  const identifier = j.identifier('request');
  hooksUsingRecord
    .find(j.Identifier, { name: 'record' })
    .closest(j.ObjectPattern)
    .find(j.Identifier, { name: 'record' })
    .replaceWith(identifier);
}

function getRecordVar(j: JSCodeshift, prefix?: string) {
  let identifier = 'request';
  if (prefix) identifier = `${prefix}.${identifier}`;

  return j.variableDeclaration(
    'const', 
    [j.variableDeclarator(
      j.identifier('record'),
      j.awaitExpression(
        j.callExpression(
          j.identifier('getRecordFromRequest'),
          [j.identifier(identifier)],
        ),
      ),
    )],
  );
}

function addRecordVar(j:JSCodeshift, hooksUsingRecord: Collection<ArrowFunctionExpression>) {
  hooksUsingRecord.forEach((hookUsingRecord) => {
    const functionParams = hookUsingRecord.node.params[0];
    const isNotDestructuring = functionParams.type === 'Identifier';
    const recordVar = isNotDestructuring ? getRecordVar(j, functionParams.name) : getRecordVar(j);

    if (isNotDestructuring) {
      j(hookUsingRecord)
        .find(j.MemberExpression, { object: { name: functionParams.name }, property: { name: 'record' } })
        .replaceWith(j.identifier('record'));
    }

    (hookUsingRecord.node.body as BlockStatement).body?.splice(0, 0, recordVar);
  });
}

function passHookToAsync(hooksUsingRecord: Collection<ArrowFunctionExpression>) {
  hooksUsingRecord.nodes().forEach(hookUsingRecord => hookUsingRecord.async = true);
}

/**
 * Deals with the following breaking change:
 * https://docs.forestadmin.com/documentation/how-tos/maintain/upgrade-notes-sql-mongodb/upgrade-to-v8#smart-actions
 */
export default function(fileInfo: FileInfo, api: API): string {
  const { j } = api;
  const root = j(fileInfo.source);

  const collectionCall = root.find(j.CallExpression, { callee: { name: 'collection' }});
  const program = collectionCall.closest(j.Program);

  if(!program.length) return root.toSource();

  const hooksUsingRecord = root.find(j.Identifier, { name: 'record' }).closest(j.ArrowFunctionExpression);
  if(!hooksUsingRecord.length) return root.toSource();

  const programBody: Program['body'] = program.get('body').value;

  if(!hasRecordFromRequestFunction(programBody)) {
    replaceRecordArgs(j, hooksUsingRecord);
    addRecordVar(j, hooksUsingRecord);
    passHookToAsync(hooksUsingRecord);

    const modelName: string = collectionCall.get('arguments').value[0].value;
    const camel = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    programBody.splice(programBody.length - 1, 0, getRecordFromRequestFunction(j, camel));

    const modelImport = root.find(j.Literal, { value: '../models' }).closest(j.VariableDeclarator);
    const modelImportProperty = j.objectProperty(j.identifier(camel), j.identifier(camel));
    modelImportProperty.shorthand = true;
    if (!modelImport.length) {
      programBody.splice(1, 0, getModelImport(j, modelImportProperty));
    } else {
      const modelImportProperties: ObjectPattern['properties'] = modelImport.get('id').get('properties').value;
      
      if(!modelImportProperties.some((property: Property) => (property.key as Identifier).name === modelName)) {
        const identifier = j.identifier(modelName);
        const modelImport = j.objectProperty(identifier, identifier);
        modelImport.shorthand = true;
        modelImportProperties.push(modelImportProperty)
      }
    }
  }
  
  return root.toSource();
}
