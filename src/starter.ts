'use strict'
import { execSync, spawn } from 'child_process'
import program, { Command } from 'commander'
import fs from 'fs'
import path, { join } from 'path'
import process from 'process'
import rimraf from 'rimraf'
import { copyFileSync, getFileList } from './fileManager'
import Log from './lib/logger'

const colorLog = new Log()

const install = (dirName: string, option: Command) => {
  let installPath: string =
    dirName == null
      ? path.resolve(process.cwd())
      : path.resolve(process.cwd(), dirName)

  if (!fs.existsSync(installPath)) {
    fs.mkdirSync(installPath)
  } else {
    // if (!fs.lstatSync(installPath).isDirectory()) {
    //   rimraf.sync(installPath)
    //   fs.mkdirSync(installPath)
    // }
    console.error('\n  ❌  Directory already exists.\n')
    return
  }

  colorLog.pre('\n  Creating a new Node project in ', `${installPath}`)

  console.log('\n\n  [1/2] 🦍  Cloning project...')
  if (option.targetRepo != null) {
    const child = spawn('git', ['clone', option.targetRepo, installPath])

    child.stdout.on('end', () => {
      rimraf.sync(path.resolve(installPath, '.git'))
      installNpmAndClosing(installPath)
    })
  } else {
    const targetPath = path.resolve(__filename, '../../sample/')
    const files: string[] = getFileList(targetPath)

    const cache = {}

    for (let [index, file] of files.entries()) {
      const parent = file.slice(0, file.length - path.basename(file).length)
      const fullPathDir = path.resolve(installPath, parent)

      if (parent.length > 0 && !cache[parent]) {
        if (!fs.existsSync(fullPathDir)) {
          fs.mkdirSync(fullPathDir)
          cache[parent] = true
        }
      }
      const fullPath = path.resolve(targetPath, file)

      copyFileSync(fullPath, fullPathDir)
    }

    installNpmAndClosing(installPath)
  }
}
const installNpmAndClosing = (installPath: string) => {
  console.log('  [2/2] 🍀  Installing packages...')
  execSync('npm install', { stdio: [0, 1, 2], cwd: `${installPath}` })

  console.log(`  ...\n\n  ✅  Node project is successfuly initialized !`)
  colorLog.post(`\n    cd `, `${installPath}`)
  colorLog.log(`\n    npm run dev `)
  console.log(`\n\n  Happy hacking ✨\n`)
}

program
  .version('0.0.1')
  .command('i [dir]')
  .option('-t, --targetRepo <repository_url>', 'Initial repository to install')
  .action(install)

program.on('--help', function() {
  console.log('\nExamples:')
  colorLog.pre('  $ ', 'node-starter i [project_name]\n')
  colorLog.pre('  $ ', 'node-starter i [project_name] -t [repository_url]\n')
  console.log('')
})

program.parse(process.argv)
