import { API, FileInfo, Options, Collection, JSCodeshift, Property, Identifier, Literal, CallExpression } from 'jscodeshift';

function getPropertyValue(properties: Property[], propertyName: string) {
  const property = properties.find(property => (property.key as Identifier).name === propertyName);
  return (property.value as Literal).value;
}

function extractFields(collectionCalls: Collection, j: JSCodeshift) {
  const fields = collectionCalls
    .find(j.Property, { key: { name: 'fields' }})
    .filter(property => property.parent.parent.get('type').value === 'CallExpression')
    .find(j.ObjectExpression);

  const addIdentifier = j.identifier('addField');
  const a: CallExpression[] = [];
  fields.forEach(field => {
    const properties = field.value.properties as Property[];
    const fieldName = getPropertyValue(properties, 'field');
    const fieldType = getPropertyValue(properties, 'type');
    a.push(
      j.callExpression(
        addIdentifier, [
          j.literal(fieldName),
          j.objectExpression([
            j.objectProperty(j.identifier('columnType'), j.literal(fieldType)),
          ]),
        ],
      ),
    );
  });

  return a;
}

export default function(fileInfo: FileInfo, api: API, options: Options) {
  const { j } = api;
  const root = j(fileInfo.source);
  const collectionCalls = root.find(j.CallExpression, { callee: { name: 'collection' } });
  const as = extractFields(collectionCalls, j).reverse();

  const i = j.identifier('module');
  const i2 = j.identifier('export');
  const me = j.memberExpression(i, i2);

  const c = j.identifier('collection');

  let last: any = as[0];
  for(let i = 1; i < as.length; i++) {
    last = j.memberExpression(as[1], last, false);
  }

  const fn = j.arrowFunctionExpression([c], j.memberExpression(c, last, false));

  collectionCalls.replaceWith(
    j.assignmentExpression('=', me, fn)
  );
  
  return root.toSource({ quote: 'single', trailingComma: true, flowObjectCommas: true });
};
