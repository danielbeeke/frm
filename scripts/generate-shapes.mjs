import fs from 'fs'

const comment = `See /shapes in the root of the project for the source files.`
const shapeFiles = fs.readdirSync('./shapes')
fs.rmSync('./src/shapes', { recursive: true, force: true }) 
fs.mkdirSync('./src/shapes')
fs.mkdirSync('./src/shapes/ttl')
for (const shapeFile of shapeFiles) {
  console.log(shapeFile)
  const shapeFileContents = fs.readFileSync(`./shapes/${shapeFile}`, 'utf-8')
  const jsShapeFileContext = `// ${comment}\n\nexport default \`\n${shapeFileContents}\n\``
  fs.writeFileSync(`./src/shapes/ttl/${shapeFile}`, shapeFileContents)
  fs.writeFileSync(`./src/shapes/${shapeFile}.ts`, jsShapeFileContext)
}