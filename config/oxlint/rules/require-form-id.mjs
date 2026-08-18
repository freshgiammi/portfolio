export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require that <form> elements have an id property set.",
      category: "Best Practices",
      recommended: true
    },
    schema: [],
    messages: {
      missingId: "<form> elements must have an id property set. Their submit buttons must rely on this via form={id}."
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type === "JSXIdentifier") {
          const tagName = node.name.name
          if (tagName === "form") {
            const hasOnSubmit = node.attributes.some(
              attr =>
                attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && attr.name?.name === "onSubmit"
            )
            if (hasOnSubmit) {
              const idAttribute = node.attributes.find(
                attr => attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && attr.name?.name === "id"
              )
              if (!idAttribute) {
                context.report({
                  node,
                  messageId: "missingId"
                })
              }
            }
          }
        }
      }
    }
  }
}
