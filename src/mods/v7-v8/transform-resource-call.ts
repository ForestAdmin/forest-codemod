import { API, FileInfo, Identifier, Collection, JSCodeshift } from 'jscodeshift';

const callIdentifiers = [
  'RecordsGetter',
  'RecordsGetter',
  'RecordCounter',
  'RecordsExporter',
  'RecordsRemover',
  'RecordCreator',
  'RecordGetter',
  'RecordUpdater',
  'RecordRemover',
];

function addArgument(j: JSCodeshift, callIdentifier: string, functionDeclarations: Collection): void {
  functionDeclarations.forEach(arrowFunction => {
    const identifier = arrowFunction.value.params[0] as Identifier;

    j(arrowFunction)
      .find(j.NewExpression, { callee: { name: callIdentifier }})
      .filter(callToRecordGetter => callToRecordGetter.value.arguments.length === 1)
      .forEach(callToRecordGetter => {
        callToRecordGetter.value.arguments.push(j.identifier(`${identifier.name}.user`), j.identifier(`${identifier.name}.query`));
      });
  });
}

function fixCall(j: JSCodeshift, root: Collection, callIdentifier: string): void {
  const functions = root.find(j.NewExpression, { callee: { name: callIdentifier }}).closest(j.FunctionDeclaration);
  addArgument(j, callIdentifier, functions);
  const arrowFunctions = root.find(j.NewExpression, { callee: { name: callIdentifier }}).closest(j.ArrowFunctionExpression);
  addArgument(j, callIdentifier, arrowFunctions);
}

/**
 * Deals with the following breaking change:
 * https://docs.forestadmin.com/documentation/how-tos/maintain/upgrade-notes-sql-mongodb/upgrade-to-v8#scopes
 */
export default function(fileInfo: FileInfo, api: API): string {
  const { j } = api;
  const root = j(fileInfo.source);

  callIdentifiers.forEach(callIdentifier => {
    fixCall(j, root, callIdentifier);
  });
  
  return root.toSource();
}
