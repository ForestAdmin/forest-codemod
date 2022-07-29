import { API, FileInfo } from "jscodeshift";

export default function (fileInfo: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const rootSource = j(fileInfo.source);

  rootSource
    // Find calls to next
    .find(j.CallExpression, {
      callee: {
        type: "Identifier",
        name: "next",
      },
      arguments: [],
    })

    // Go to the nearest block
    .closest(j.BlockStatement)

    // Keep only blocks which
    // - Have only one statement (the 'next()' CallExpression)
    // - Are direct children of an arrow function which have three parameters
    .filter(
      (block) =>
        block.node.body.length === 1 &&
        block.parent.node.type === "ArrowFunctionExpression" &&
        block.parent.node.params.length === 3
    )

    // Go up all the way to the call of 'router.xxx'
    .closest(j.ExpressionStatement, {
      expression: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: { type: "Identifier", name: "router" },
          property: { type: "Identifier" },
        },
      },
    })

    // Remove the node
    .remove();

  return rootSource.toSource();
}
