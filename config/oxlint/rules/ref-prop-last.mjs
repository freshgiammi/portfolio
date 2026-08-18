/**
 * @fileoverview ESLint rule to ensure ref prop is always the last prop in JSX elements
 */

export default {
  meta: {
    type: "layout",
    docs: {
      description: "enforce ref prop to be the last prop in JSX elements",
      category: "Stylistic Issues",
      recommended: true
    },
    fixable: "code",
    schema: [],
    messages: {
      refPropNotLast: "ref prop must be the last prop in JSX element"
    }
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()

    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes
        if (!attributes || attributes.length < 2) {
          // If there are less than 2 attributes, ordering doesn't matter
          return
        }

        // Find the ref attribute
        let refIndex = -1
        let refAttr = null

        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i]
          if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier" && attr.name.name === "ref") {
            refIndex = i
            refAttr = attr
            break
          }
        }

        // If there's no ref attribute, or it's already last, we're good
        if (refIndex === -1 || refIndex === attributes.length - 1) {
          return
        }

        // ref is not last, report it
        context.report({
          node: refAttr,
          messageId: "refPropNotLast",
          fix(fixer) {
            // Get all attributes except ref
            const otherAttrs = attributes.filter((_, i) => i !== refIndex)

            // Build the text for all attributes with ref last
            const allAttrTexts = []

            // Add all other attributes first
            for (const attr of otherAttrs) {
              const attrText = sourceCode.getText(attr)
              allAttrTexts.push(attrText)
            }

            // Add ref last
            const refText = sourceCode.getText(refAttr)
            allAttrTexts.push(refText)

            // Get the range from the first attribute to the last attribute
            const firstAttr = attributes[0]
            const lastAttr = attributes[attributes.length - 1]
            const rangeStart = firstAttr.range[0]
            const rangeEnd = lastAttr.range[1]

            // Determine if attributes are on the same line or multi-line
            const firstLine = sourceCode.getLocFromIndex(firstAttr.range[0]).line
            const lastLine = sourceCode.getLocFromIndex(lastAttr.range[1]).line
            const isMultiLine = firstLine !== lastLine

            if (isMultiLine) {
              // For multi-line, preserve formatting and indentation
              const indentedAttrs = []

              for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i]
                const attrStart = attr.range[0]
                const attrEnd = attr.range[1]

                // Get the whitespace before this attribute
                let precedingWhitespace = ""
                if (i === 0) {
                  // For the first attribute, get whitespace from element name to attribute
                  const elementNameEnd = node.name.range[1]
                  precedingWhitespace = sourceCode.text.slice(elementNameEnd, attrStart)
                } else {
                  // For subsequent attributes, get whitespace from previous attribute end
                  const prevAttrEnd = attributes[i - 1].range[1]
                  precedingWhitespace = sourceCode.text.slice(prevAttrEnd, attrStart)
                }

                indentedAttrs.push({
                  text: sourceCode.getText(attr),
                  whitespace: precedingWhitespace,
                  isRef: i === refIndex
                })
              }

              // Reorder: move ref to the end while preserving its whitespace
              const refAttrData = indentedAttrs.splice(refIndex, 1)[0]
              indentedAttrs.push(refAttrData)

              // Build the replacement text
              let replacementText = ""
              for (let i = 0; i < indentedAttrs.length; i++) {
                replacementText += indentedAttrs[i].whitespace + indentedAttrs[i].text
              }

              // Replace from element name end to last attribute end
              const elementNameEnd = node.name.range[1]
              const lastAttrEnd = attributes[attributes.length - 1].range[1]

              return fixer.replaceTextRange([elementNameEnd, lastAttrEnd], replacementText)
            } else {
              // For single-line, join attributes with a space
              const replacementText = " " + allAttrTexts.join(" ")

              // Replace from element name end to last attribute end
              const elementNameEnd = node.name.range[1]
              const lastAttrEnd = attributes[attributes.length - 1].range[1]

              return fixer.replaceTextRange([elementNameEnd, lastAttrEnd], replacementText)
            }
          }
        })
      }
    }
  }
}
