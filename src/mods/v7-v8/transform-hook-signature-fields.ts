import { API, FileInfo, Collection, JSCodeshift, Identifier, CallExpression, BinaryExpression } from 'jscodeshift';

function getFindCallExpression(j: JSCodeshift, fieldName: BinaryExpression['right'], prefix?: string): CallExpression {
  if (prefix) return j.template.expression`${prefix}.fields.find(field => field.field === ${fieldName});`;

  return j.template.expression`fields.find(field => field.field === ${fieldName});`;
}

/**
 * Work inside hooks with arrow function
 * 
 * const { field } = fields;
 * 
 * replaced one by one find by assignement
 * const field = fields.find(...);
 * 
 * use prefix to work with nested props
 * const { field } = prefix.fields;
 * 
 * replaced one by one find by assignement
 * const field = prefix.fields.find(...);
 */
function replaceObjectAssignDeclaration(j: JSCodeshift, hookObjects: Collection, prefix?: string): void {
  const init = prefix ? { property: { name: 'fields' }} : { name: 'fields' };

  hookObjects
    .find(j.VariableDeclaration, { declarations: [{ init }] })
    .forEach(declaration => {
      j(declaration)
        .find(j.Property)
        .forEach(property => {
          const fieldName = property.value.key as Identifier;
          const newDeclaration = j.variableDeclaration(
            'const',
            [j.variableDeclarator(
              fieldName,
              getFindCallExpression(j, j.literal(fieldName.name), prefix),
            )],
          );

          declaration.insertAfter(newDeclaration);
        });
    })
    .remove();
}

/**
 * Work inside hooks with arrow function
 * defined like this ({ fields }) => {}
 * 
 * fields.field
 * fields['field']
 * 
 * replaced by find
 * fields.find(...);
 * 
 * use prefix to work with nested props
 * const { field } = prefix.fields;
 * 
 * prefix.fields.field
 * prefix.fields['field']
 * 
 * replaced by find
 * prefix.fields.find(...);
 */
function replaceFieldsCall(j: JSCodeshift, hookObjects: Collection, prefix?: string): void {
  const filter = prefix ? { property: { name: 'fields' }} : { object: { name: 'fields' }};

  let fieldsCall = hookObjects.find(j.MemberExpression, filter);

  if(prefix) fieldsCall = fieldsCall.closest(j.MemberExpression);
  
  fieldsCall
    .filter(fieldCall => fieldCall.parent.value?.type !== 'CallExpression')
    .forEach(fieldCall => {
      const { value } = fieldCall;
      const isComputed = value.computed;
      const fieldName = isComputed ? value.property : j.literal((value.property as Identifier).name);

      fieldCall.replace(
        getFindCallExpression(j, fieldName, prefix),
      );
    });
}

/**
 * Work inside hooks with arrow function
 * defined like this context => {} or (context) => {}
 * 
 * use replaceObjectAssignDeclaration with prefix
 * use replaceFieldsCall with prefix
 */
function replaceOnNotDestructuredFunction(j: JSCodeshift, hookObjects: Collection): void {
  hookObjects
  .find(j.ArrowFunctionExpression, { expression: false })
  .filter(arrowExpression => arrowExpression.node.params[0]?.type === 'Identifier')
  .forEach(arrowExpression => {
    const identifier = arrowExpression.node.params[0] as Identifier;

    replaceObjectAssignDeclaration(j, j(arrowExpression), identifier.name);
    replaceFieldsCall(j, j(arrowExpression), identifier.name);
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
  replaceOnNotDestructuredFunction(j, loadHooks);
  const changeHooks = hookObjects.find(j.Property, { key: { name: 'change' }});
  replaceFieldsCall(j, changeHooks);
  replaceObjectAssignDeclaration(j, changeHooks);
  replaceOnNotDestructuredFunction(j, changeHooks);
  
  return root.toSource();
}
