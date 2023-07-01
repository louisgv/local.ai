import { Parser } from "acorn"
import acornJsx from "acorn-jsx"

function replacer(_: any, value: any) {
  if (value === "" || value === null) {
    return undefined
  }
  return value
}

export const getMdxProp = <T>(config: T, configKey: keyof T, propKey = "") => {
  const value = config[configKey]
  const pKey = String(propKey || configKey)
  switch (typeof value) {
    case "string": {
      if (value.length > 0) {
        return `\n\t${pKey}="${value}"`
      }
      break
    }
    case "number":
    case "boolean": {
      return `\n\t${pKey}={${value}}`
    }
    case "object": {
      if (value !== null) {
        return `\n\t${pKey}={${JSON.stringify(value, replacer, 2)}}`
      }
      break
    }
  }
  return ""
}

export const getMdxTickProp = <T>(
  config: T,
  configKey: keyof T,
  propKey = ""
) => {
  const value = config[configKey]
  const pKey = String(propKey || configKey)

  if (typeof value !== "string" || value.length === 0) {
    return ""
  }

  return `\n\t${pKey}={\`\n${value.replace(/`/g, "\\`")}\n\t\`}`
}

export const MdxParser = Parser.extend(acornJsx())

function getValue(node: any) {
  switch (node.type) {
    case "Literal":
      return node.value
    case "TemplateLiteral":
      return node.quasis[0].value.raw
    case "ArrayExpression":
      return node.elements.map(getValue)
    case "ObjectExpression":
      return node.properties.reduce((obj, prop) => {
        obj[prop.key.name] = getValue(prop.value)
        return obj
      }, {})
  }
}

export const extractProps = <T>(code: string) => {
  const ast = MdxParser.parse(code, { ecmaVersion: 2022 })
  // Store the props here
  const props = {}

  // Function to traverse AST
  function traverse(node: any) {
    if (Array.isArray(node)) {
      node.forEach((n) => traverse(n))
    } else if (node && typeof node === "object") {
      if (node.type === "JSXOpeningElement") {
        node.attributes.forEach((attr) => {
          if (attr.type === "JSXAttribute") {
            const propName = attr.name.name
            if (attr.value.type === "Literal") {
              props[propName] = attr.value.value
            } else if (attr.value.type === "JSXExpressionContainer") {
              props[propName] = getValue(attr.value.expression)
            }
          }
        })
      } else {
        Object.values(node).forEach(traverse)
      }
    }
  }

  traverse(ast)
  return props as T
}

/*

// Usage: 

const ast = MdxParser.parse(code, { ecmaVersion: 2022 })
const props = extractProps(ast)
*/
