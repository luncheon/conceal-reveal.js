const fs = require('fs')
const path = require('path')
const resolvePath = relativePath => path.resolve(__dirname, '..', relativePath)
const package = require(resolvePath('package.json'))

const template = fs.readFileSync(resolvePath('README.template.md'), 'utf8')
const content = template.replace(/{{(.+?)}}/g, (_, path) => path.split('.').reduce((obj, prop) => obj[prop], package))
fs.writeFileSync(resolvePath('README.md'), content, 'utf8')
