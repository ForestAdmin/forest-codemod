import { API, FileInfo, Collection, JSCodeshift, Identifier, CallExpression, BinaryExpression } from 'jscodeshift';

function getFindCallExpression(j: JSCodeshift, fieldName: BinaryExpression['right']): CallExpression {
  return j.template.expression`fields.find(field => field.field === ${fieldName});`;
}

function replaceObjectAssignDeclaration(j: JSCodeshift, hookObjects: Collection): void {
  hookObjects
    .find(j.VariableDeclaration, { declarations: [{ init: { name: 'fields' } }] })
    .forEach(declaration => {
      j(declaration)
        .find(j.Property)
        .forEach(property => {
          const fieldName = property.value.key as Identifier;
          const newDeclaration = j.variableDeclaration(
            'const',
            [j.variableDeclarator(
              fieldName,
              getFindCallExpression(j, j.literal(fieldName.name)),
            )],
          );

          declaration.insertAfter(newDeclaration);
        });
    })
    .remove();
}

function replaceFieldsCall(j: JSCodeshift, hookObjects: Collection): void {
  hookObjects
    .find(j.MemberExpression, { object: { name: 'fields' }})
    .filter(fieldsCall => fieldsCall.parent.value.type !== 'CallExpression')
    .forEach(fieldsCall => {
      const { value } = fieldsCall;
      const isComputed = value.computed;
      const fieldName = isComputed ? value.property : j.literal((value.property as Identifier).name);

      fieldsCall.replace(
        getFindCallExpression(j, fieldName),
      );
    });
}

/**
 * Deals with the following breaking change:
 * https://docs.forestadmin.com/documentation/how-tos/maintain/upgrade-notes-sql-mongodb/upgrade-to-v8#smart-actions
 */
export default function(fileInfo: FileInfo, api: API): string {
  const { j } = api;
  const root = j(fileInfo.source);

  const hookObjects = root.find(j.Property, { key: { name: 'hooks' }});

  const loadHooks = hookObjects.find(j.Property, { key: { name: 'load' }});
  replaceFieldsCall(j, loadHooks);
  replaceObjectAssignDeclaration(j, loadHooks);
  const changeHooks = hookObjects.find(j.Property, { key: { name: 'change' }});
  replaceFieldsCall(j, changeHooks);
  replaceObjectAssignDeclaration(j, changeHooks);
  
  return root.toSource();
}
