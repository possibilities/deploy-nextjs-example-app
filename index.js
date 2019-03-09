const sh = require('shelljs')
const { join, relative, dirname } = require('path')
const { ulid } = require('ulid')
const findProjectFiles = require('find-project-files')

sh.config.silent = true

const runNowAlias = process.argv.includes('--alias')
const libraryDir = sh.pwd().stdout
const exampleDir = join(libraryDir, 'example')
const libraryManifest = join(libraryDir, 'package.json')
const exampleManifest = join(exampleDir, 'package.json')
const workspaceDir = join(sh.tempdir(), ulid())

if (!sh.test('-f', libraryManifest)) {
  sh.echo('expected ./package.json to exist')
  sh.exit(1)
}
if (!sh.test('-f', exampleManifest)) {
  sh.echo('expected ./example/package.json to exist')
  sh.exit(1)
}

sh.echo(`┌ temporary workspace: "${workspaceDir}/example"`)
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
sh.exec('yarn add file:./library')

sh.echo(`│ create now.sh deployment`)
const deploymentUrl = sh.exec('now --no-clipboard').stdout
sh.echo(`├ deployment "${deploymentUrl}" ready`)

if (runNowAlias) {
  sh.echo(`│ create alias to latest deployment`)
  const aliasUrl = sh
    .exec(`now alias set ${deploymentUrl}`)
    .split('\n')
    .split(' ')[2]
  sh.echo(`└ alias "https://${aliasUrl}" updated`)
}
