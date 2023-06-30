import { API, ArrayExpression, FileInfo } from "jscodeshift";

/**
 * Deals with the following breaking change:
 * https://docs.forestadmin.com/documentation/how-tos/maintain/upgrade-notes-sql-mongodb/upgrade-to-v8#cors-allowed-headers
 *
 * Before:
 * const corsConfig = { allowedHeaders: [...] };
 *
 * After:
 * const corsConfig = { allowedHeaders: ["Forest-Context-Url", ...] };
 */
export default function (fileInfo: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const rootSource = j(fileInfo.source);

  rootSource
    // get Property where key == 'allowedHeaders'
    .find(j.Property, {
      key: { name: "allowedHeaders" },
    })
    .forEach(headerArray => {
      const exp = headerArray.value.value as ArrayExpression;

      if(exp.elements.some( node => node.type === 'Literal' && node.value.toString().toLocaleLowerCase() === 'forest-context-url')) return;

      exp.elements.push(j.stringLiteral("Forest-Context-Url"))
    });

    // console.log(a);
    // // get Array
    // .map<ArrayExpression>((path) => path.get("value"))

    // // Ignore those which already have the header
    // .filter((path) =>
    //   path.node.elements.every(
    //     (node) =>
    //       node.type === "StringLiteral" &&
    //       node.value.toLowerCase() !== "forest-context-url"
    //   )
    // )

    // // Add the header
    // .forEach((path) =>
    //   path.node.elements.unshift(j.stringLiteral("Forest-Context-Url"))
    // );

  return rootSource.toSource();
}

// use the flow parser
module.exports.parser = "flow";
