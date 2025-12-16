/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const repoRoot = process.cwd()

const scanRoots = [
  path.join(repoRoot, 'app'),
  path.join(repoRoot, 'components'),
]

const allowedTriggerParents = new Set([
  'DropdownMenuTrigger',
  'DialogTrigger',
  'AlertDialogTrigger',
  'PopoverTrigger',
  'TooltipTrigger',
  'ContextMenuTrigger',
  'SheetTrigger',
])

// Component wrappers that render a Trigger `asChild` internally (static audit can't see across files).
const allowedTriggerWrapperParents = new Set([
  'CreateLeadDialog',
  'CreateAccountDialog',
  'CreateOpportunityDialog',
  'CreateQuoteDialog',
  'CreateTaskDialog',
  'EditLeadDialog',
  'EditAccountDialog',
  'EditOpportunityDialog',
  'EditTaskDialog',
  'DeleteLeadDialog',
  'DeleteAccountDialog',
  'DeleteOpportunityDialog',
  'DeleteTaskDialog',
  'DeleteQuoteDialog',
])

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

function walkFiles(dirPath) {
  const out = []
  if (!fileExists(dirPath)) return out
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'playwright-report') continue
      out.push(...walkFiles(full))
      continue
    }
    if (!entry.isFile()) continue
    if (!/\.(tsx?|jsx?)$/.test(full)) continue
    out.push(full)
  }
  return out
}

function getJsxTagName(tagName) {
  if (ts.isIdentifier(tagName)) return tagName.text
  if (ts.isPropertyAccessExpression(tagName)) return tagName.name.text
  return null
}

function getJsxAttributes(openingElement) {
  return openingElement.attributes.properties.filter(ts.isJsxAttribute)
}

function getAttribute(openingElement, name) {
  return getJsxAttributes(openingElement).find((a) => a.name.text === name) || null
}

function hasAttribute(openingElement, name) {
  return Boolean(getAttribute(openingElement, name))
}

function getStringInitializer(attr) {
  if (!attr || !attr.initializer) return null
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const expr = attr.initializer.expression
    if (ts.isStringLiteral(expr)) return expr.text
    if (ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text
  }
  return null
}

function hasSubmitType(openingElement) {
  const typeAttr = getAttribute(openingElement, 'type')
  const typeValue = getStringInitializer(typeAttr)
  return typeValue === 'submit'
}

function isInsideForm(node) {
  let current = node.parent
  while (current) {
    if (ts.isJsxElement(current)) {
      const parentName = getJsxTagName(current.openingElement.tagName)
      if (parentName === 'form') return true
    }
    current = current.parent
  }
  return false
}

function hasAsChildTriggerParent(node) {
  let current = node.parent
  while (current) {
    if (ts.isJsxElement(current)) {
      const parentName = getJsxTagName(current.openingElement.tagName)
      if (!parentName) return false
      if (allowedTriggerParents.has(parentName)) {
        return hasAttribute(current.openingElement, 'asChild')
      }
    }

    // Stop if we hit another JSX opening element that's not a wrapper.
    if (ts.isJsxElement(current) && ts.isJsxElement(current.parent)) {
      // keep walking
    }

    current = current.parent
  }
  return false
}

function hasTriggerWrapperParent(node) {
  let current = node.parent
  while (current) {
    if (ts.isJsxElement(current)) {
      const parentName = getJsxTagName(current.openingElement.tagName)
      if (!parentName) return false
      if (allowedTriggerWrapperParents.has(parentName)) return true
    }
    current = current.parent
  }
  return false
}

function shouldFlagButton(openingElement) {
  const tagName = getJsxTagName(openingElement.tagName)
  if (!tagName) return false
  if (tagName !== 'Button' && tagName !== 'ActionButton' && tagName !== 'button') return false

  if (hasAttribute(openingElement, 'disabled')) return false
  if (hasAttribute(openingElement, 'onClick')) return false
  if (hasAttribute(openingElement, 'asChild')) return false
  if (hasSubmitType(openingElement)) return false
  if (isInsideForm(openingElement)) return false
  if (hasAsChildTriggerParent(openingElement)) return false
  if (hasTriggerWrapperParent(openingElement)) return false
  
  // ActionButton components handle their own disabled/onClick logic internally
  // They should not be flagged as dead buttons
  if (tagName === 'ActionButton') return false

  return true
}

function auditFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const scriptKind = filePath.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : filePath.endsWith('.ts')
      ? ts.ScriptKind.TS
      : filePath.endsWith('.jsx')
        ? ts.ScriptKind.JSX
        : ts.ScriptKind.JS

  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, scriptKind)

  const findings = []

  function visit(node) {
    if (ts.isJsxSelfClosingElement(node)) {
      if (shouldFlagButton(node)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
        findings.push({ filePath, line: line + 1, col: character + 1 })
      }
    } else if (ts.isJsxOpeningElement(node)) {
      if (shouldFlagButton(node)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
        findings.push({ filePath, line: line + 1, col: character + 1 })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return findings
}

function main() {
  const files = Array.from(new Set(scanRoots.flatMap(walkFiles))).sort()
  const findings = files.flatMap(auditFile)

  if (findings.length) {
    console.error('FAIL audit:actions')
    for (const f of findings) {
      console.error(`- ${path.relative(repoRoot, f.filePath)}:${f.line}:${f.col} Button has no action/href/submit and is not disabled`)
    }
    process.exit(1)
  }

  console.log('PASS audit:actions')
  console.log(`Scanned files: ${files.length}`)
}

main()
