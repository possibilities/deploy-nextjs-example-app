const sh = require('shelljs')
const { join, relative, dirname } = require('path')
const { ulid } = require('ulid')
const findProjectFiles = require('find-project-files')

const ensureArray = obj => Array.isArray(obj) ? obj : [obj]

const isVerbose = process.argv.includes('--verbose')
const runNowAlias = process.argv.includes('--alias')
const libraryDir = sh.pwd().stdout
const exampleDir = join(libraryDir, 'example')
const libraryManifest = join(libraryDir, 'package.json')
const exampleManifest = join(exampleDir, 'package.json')
const workspaceDir = join(sh.tempdir(), ulid())

sh.config.silent = !isVerbose

if (!sh.test('-f', libraryManifest)) {
  sh.echo('expected ./package.json to exist')
  sh.exit(1)
}
if (!sh.test('-f', exampleManifest)) {
  sh.echo('expected ./example/package.json to exist')
  sh.exit(1)
}

const handleError = result => {
  if (!result.code) return result
  console.error(result.stderr)
  sh.exit(1)
}

sh.echo(`┌ temporary workspace → "${workspaceDir}/example"`)
sh.echo(`│ copy source code to workspace`)
findProjectFiles(libraryDir).forEach(file => {
  if (!file.stats.isFile()) return
  const relPath = relative(libraryDir, file.path)
  const destPath = join(workspaceDir, 'library', relPath)
  sh.mkdir('-p', dirname(destPath))
  sh.cp(file.path, destPath)
})

sh.echo(`│ move files around in workspace dir`)
// Move `./example/ out of the library (root) and the library into the `./example`
sh.mv(join(workspaceDir, 'library', 'example'), join(workspaceDir, 'example'))
sh.mv(join(workspaceDir, 'library'), join(workspaceDir, 'example', 'library'))

sh.echo(`│ link the library to the example`)
sh.cd(join(workspaceDir, 'example'))
handleError(sh.exec('yarn add file:./library'))

sh.echo(`│ install the example dependencies`)
sh.cd(join(workspaceDir, 'example', 'library'))
handleError(sh.exec('yarn install'))
const build = handleError(sh.echo(`│ build the example artifacts`))
handleError(sh.exec('yarn build'))

sh.echo(`│ create now.sh deployment`)
sh.cd(join(workspaceDir, 'example'))
const deployment = handleError(sh.exec('now --no-clipboard'))
const deploymentUrl = deployment.stdout

if (runNowAlias) {
  const deployManifest = require(join(exampleDir, 'now.json'), 'utf8')
  ensureArray(deployManifest.alias).forEach(alias => {
    sh.echo(`└ alias creating "${deploymentUrl}" → "https://${alias}"`)
    handleError(sh.exec(`now alias set ${deploymentUrl} ${alias}`))
  })
}
