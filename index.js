const sh = require('shelljs')
const { join, relative, dirname } = require('path')
const { ulid } = require('ulid')
const findProjectFiles = require('find-project-files')

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
  if (result.code) {
    console.error(deployment.stderr)
    sh.exit(1)
  }
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

sh.echo(`│ install the example dependencies`)
sh.cd(join(workspaceDir, 'example', 'library'))
sh.exec('yarn install')
const build = sh.echo(`│ build the example artifacts`)
handleError(build)
sh.exec('yarn build')

sh.echo(`│ create now.sh deployment`)
sh.cd(join(workspaceDir, 'example'))
const deployment = sh.exec('now --no-clipboard')
handleError(deployment)
sh.echo(`├ deployment "${deployment.stdout}" ready`)

if (runNowAlias) {
  sh.echo(`│ create alias to latest deployment`)
  const alias = sh
    .exec(`now alias set ${deployment.stdout}`)

  if (!alias.stderr.includes('is a deployment URL or')) handleError(alias)
  if (alias.code) {
    console.warn('└ exited without creating alias')
    process.exit(0)
  }

  const aliasUrl = alias.stdout.split('\n').split(' ')[2]
  sh.echo(`└ alias "https://${aliasUrl}" updated`)
}
