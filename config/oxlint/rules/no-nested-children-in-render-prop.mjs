/**
 * @fileoverview ESLint rule to discourage passing nested children in render props
 * Encourages moving children outside of the render prop for better component composition
 */

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "discourage passing nested children in render props, prefer passing children to the parent component instead",
      category: "Best Practices",
      recommended: true
    },
    fixable: "code",
    schema: [],
    messages: {
      nestedChildrenInRenderProp:
        "Avoid passing nested children within the render prop. Instead, pass the component without children in the render prop and provide the children to the parent component."
    }
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const artUiComponents = new Set()

    // Detect if we're inside the art-ui package by checking the file path
    const filename = context.filename || context.getFilename()
    const isInsideArtUiPackage = filename.includes("/packages/ui/") || filename.includes("@bcmi-labs/art-ui")

    // Helper to check if a component is from art-ui
    function isArtUiComponent(componentName) {
      return artUiComponents.has(componentName)
    }

    // Helper to get component name from JSX element
    function getComponentName(node) {
      if (node.name.type === "JSXIdentifier") {
        return node.name.name
      } else if (node.name.type === "JSXMemberExpression") {
        // Handle cases like DropdownMenu.Trigger
        let current = node.name
        let rootName = null
        while (current) {
          if (current.type === "JSXMemberExpression") {
            current = current.object
          } else if (current.type === "JSXIdentifier") {
            rootName = current.name
            break
          } else {
            break
          }
        }
        return rootName
      }
      return null
    }

    // Helper to check if a JSXElement has children
    function hasJSXChildren(element) {
      if (!element || element.type !== "JSXElement") {
        return false
      }
      return (
        element.children &&
        element.children.length > 0 &&
        element.children.some(child => {
          // Check for non-whitespace children
          if (child.type === "JSXText") {
            return child.value.trim().length > 0
          }
          return child.type === "JSXElement" || child.type === "JSXExpressionContainer"
        })
      )
    }

    return {
      // Track imports from art-ui
      ImportDeclaration(node) {
        const source = node.source.value

        // Track components imported from art-ui package (for consumer usage)
        if (source === "@bcmi-labs/art-ui" || source.startsWith("@bcmi-labs/art-ui/")) {
          node.specifiers.forEach(spec => {
            if (spec.type === "ImportSpecifier" || spec.type === "ImportDefaultSpecifier") {
              const importedName = spec.local.name
              artUiComponents.add(importedName)
            }
          })
        }
      },

      // Check JSX elements with render prop
      JSXAttribute(node) {
        // Only check 'render' attributes
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "render") {
          return
        }

        // Get the parent JSXOpeningElement to check the component name
        const jsxOpeningElement = node.parent
        if (!jsxOpeningElement || jsxOpeningElement.type !== "JSXOpeningElement") {
          return
        }

        // If we're inside the art-ui package, apply to all render props
        // If we're in a consumer, only apply to art-ui components
        if (!isInsideArtUiPackage) {
          const componentName = getComponentName(jsxOpeningElement)
          if (!componentName || !isArtUiComponent(componentName)) {
            return
          }
        }

        // Check if the render prop value is a JSXElement with children
        if (node.value && node.value.type === "JSXExpressionContainer") {
          const expression = node.value.expression

          if (hasJSXChildren(expression)) {
            context.report({
              node: node.value,
              messageId: "nestedChildrenInRenderProp",
              fix(fixer) {
                // Get the parent JSXElement (the one with the render attribute)
                const parentElement = jsxOpeningElement.parent
                if (!parentElement || parentElement.type !== "JSXElement") {
                  return null // Can't autofix if parent structure is unexpected
                }

                // Get the children from the render prop element
                const renderChildren = expression.children
                const childrenText = sourceCode
                  .getText()
                  .slice(expression.openingElement.range[1], expression.closingElement.range[0])

                // Create self-closing version of the render prop element
                const openingElementText = sourceCode.getText(expression.openingElement)
                const selfClosingElementText = openingElementText.replace(/>$/, " />")

                // Replace the render prop's JSX element with self-closing version
                const newRenderValue = `{${selfClosingElementText}}`

                const fixes = []

                // 1. Replace the render prop value with self-closing element
                fixes.push(fixer.replaceText(node.value, newRenderValue))

                // 2. Convert parent to have children if it's self-closing
                if (parentElement.openingElement.selfClosing) {
                  // Convert self-closing to opening tag
                  fixes.push(
                    fixer.replaceTextRange(
                      [parentElement.openingElement.range[1] - 2, parentElement.openingElement.range[1]],
                      ">"
                    )
                  )
                  // Add children and closing tag
                  fixes.push(
                    fixer.insertTextAfter(
                      parentElement.openingElement,
                      `\n${childrenText}\n</${sourceCode.getText(parentElement.openingElement.name)}>`
                    )
                  )
                } else {
                  // Parent already has children, insert at the beginning
                  fixes.push(
                    fixer.insertTextAfterRange(
                      [parentElement.openingElement.range[1], parentElement.openingElement.range[1]],
                      `\n${childrenText}`
                    )
                  )
                }

                return fixes
              }
            })
          }
        }
      }
    }
  }
}
