import { API, FileInfo, Collection, JSCodeshift, Identifier, CallExpression, BinaryExpression, Program } from 'jscodeshift';

function getRecordFromRequestFunctionExpression(j: JSCodeshift) {
  const functionDeclaration = j.functionDeclaration(
    j.identifier('getRecordFromRequest'),
    [j.identifier('request')],
    j.blockStatement(
      [
        j.variableDeclaration(
          "const",
          [j.variableDeclarator(
            j.arrayPattern(
              [j.identifier('id')],
            ),
            j.memberExpression(
              j.identifier('request'),
              j.memberExpression(
                j.identifier('body'),
                j.memberExpression(
                  j.identifier('data'),
                  j.memberExpression(
                    j.identifier('attributes'),
                    j.identifier('ids'),
                    false,
                  ),
                  false,
                ),
                false
              ),
              false,
            ),
          )],
        ),
      ],
    ),
  );
  functionDeclaration.async = true;
  return functionDeclaration;
}

export default function(fileInfo: FileInfo, api: API): string {
  const { j } = api;
  const root = j(fileInfo.source);

  const program = root
    .find(j.CallExpression, { callee: { name: 'collection' }})
    .closest(j.Program);

  if(program.length) {
    const programBody: Program['body'] = program.get('body').value;

    if(!programBody.some(exp => exp.type === 'FunctionDeclaration' && exp.id.name === 'getRecordFromRequest')) {
      programBody.splice(1, 0, getRecordFromRequestFunctionExpression(j));
    }
  }
  
  return root.toSource();
}
