import { API, FileInfo, ObjectExpression } from "jscodeshift";

/**
 * Deals with the first change in:
 * https://docs.forestadmin.com/documentation/how-tos/maintain/upgrade-notes-sql-mongodb/upgrade-to-v8#smart-actions
 *
 * Before:
 * collection("companies", {
 *   actions: [{
 *     fields: [{ field: "a field" }],
 *     hooks: {
 *       change: {
 *         "a field": ({ fields }) => { ,,, },
 *       },
 *     },
 *   }],
 * });
 *
 * After:
 * collection("companies", {
 *   actions: [{
 *     fields: [{ field: "a field", hook: 'hook_0' }],
 *     hooks: {
 *       change: {
 *         hook_0: ({ fields }) => { ,,, },
 *       },
 *     },
 *   }],
 * });
 *
 */
export default function (fileInfo: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const rootSource = j(fileInfo.source);

  rootSource
    // Find calls to 'collection'
    .find(j.CallExpression, {
      callee: { type: "Identifier", name: "collection" },
    })

    // Map them to list of smart actions
    .map<ObjectExpression>((collectionCall) => {
      try {
        // Get options from `collection(name, options)`
        const options = collectionCall.get("arguments", 1);

        // Get value from `{actions: value, ...}`
        const actionsListIdx = options.node.properties.findIndex(
          (p) => p.key.name === "actions"
        );
        const actionList = options.get("properties", actionsListIdx, "value");

        // Get individual paths inside of the action array
        const actions = actionList.node.elements.map((_, actionIdx) =>
          actionList.get("elements", actionIdx)
        );

        return actions;
      } catch (e) {
        return null;
      }
    })

    // Set
    .forEach((action: any) => {
      try {
        // Get change hooks and fields
        const fields = action.node.properties.find(
          (p) => p.key.name === "fields"
        );
        const hooks = action.node.properties.find(
          (p) => p.key.name === "hooks"
        );
        const change = hooks.value.properties.find(
          (p) => p.key.name === "change"
        );

        // For each changeHook
        for (const [index, changeHook] of change.value.properties.entries()) {
          const hookName = `hook_${index}`;

          // Get field name, and replace by 'hookX'
          const fieldName = changeHook.key.value ?? changeHook.key.name;
          changeHook.key = j.identifier(hookName);

          // Search for the field
          const field = fields.value.elements.find((f) =>
            f.properties.some(
              (p) => p.key.name === "field" && p.value.value === fieldName
            )
          );

          // Create new property
          if (field) {
            const newProperty = j.objectProperty(
              j.identifier("hook"),
              j.stringLiteral(hookName)
            );

            field.properties.push(newProperty);
          }
        }
      } catch {}
    });

  return rootSource.toSource();
}
