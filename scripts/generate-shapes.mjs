import fs from 'fs'

const comment = `See /shapes in the root of the project for the source files.`
const shapeFiles = fs.readdirSync('./shapes')
fs.rmSync('./src/shapes', { recursive: true, force: true }) 
fs.mkdirSync('./src/shapes')
for (const shapeFile of shapeFiles) {
  const shapeFileContents = fs.readFileSync(`./shapes/${shapeFile}`, 'utf-8')
  const jsShapeFileContext = `// ${comment}\n\nexport default \`\n${shapeFileContents}\n\``
  fs.writeFileSync(`./src/shapes/${shapeFile}.ts`, jsShapeFileContext)
}