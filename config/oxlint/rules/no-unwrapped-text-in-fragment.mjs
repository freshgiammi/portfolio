export default {
  meta: {
    type: "problem",
    docs: {
      description: "disallow unwrapped text nodes inside React Fragments"
    },
    messages: {
      unwrappedText:
        "Text nodes must not be directly inside a React Fragment (<>...</>). Wrap them in an element or component."
    },
    fixable: "code",
    schema: []
  },

  create(context) {
    function checkChildren(children) {
      children.forEach(child => {
        if (child.type === "JSXText" && child.value.trim() !== "") {
          context.report({
            node: child,
            messageId: "unwrappedText",
            fix: fixer => {
              const text = child.value
              return fixer.replaceText(child, `<span>${text}</span>`)
            }
          })
        }
      })
    }

    return {
      JSXFragment(node) {
        checkChildren(node.children)
      },
      JSXElement(node) {
        const { name } = node.openingElement

        if (
          name &&
          ((name.type === "JSXIdentifier" && name.name === "Fragment") ||
            (name.type === "JSXMemberExpression" &&
              name.property.type === "JSXIdentifier" &&
              name.property.name === "Fragment"))
        ) {
          checkChildren(node.children)
        }
      }
    }
  }
}
