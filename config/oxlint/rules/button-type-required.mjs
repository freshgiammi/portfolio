/**
 * @fileoverview ESLint rule to ensure button elements always have a type attribute
 * This prevents accidental form submissions since the default type is "submit"
 */

export default {
  meta: {
    type: "problem",
    docs: {
      description: "enforce type attribute on button elements to prevent accidental form submissions",
      category: "Best Practices",
      recommended: true
    },
    fixable: "code",
    schema: [],
    messages: {
      missingType:
        "button element must have a type attribute (button, submit, or reset). Default is 'submit' which may cause accidental form submissions."
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // Only check native button elements (lowercase)
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "button") {
          return
        }

        // Check if type attribute exists
        const hasTypeAttribute = node.attributes.some(
          attr => attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier" && attr.name.name === "type"
        )

        if (!hasTypeAttribute) {
          context.report({
            node,
            messageId: "missingType",
            fix(fixer) {
              // Add type="button" as the first attribute
              const elementName = node.name
              const insertPosition = elementName.range[1]

              return fixer.insertTextAfterRange([insertPosition, insertPosition], ' type="button"')
            }
          })
        }
      }
    }
  }
}
