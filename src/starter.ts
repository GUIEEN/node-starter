"use strict"
import { execSync, exec } from "child_process"
import ColorLog from "colorlog-css"
import program, { Command } from "commander"
import fs from "fs-extra"
import path from "path"
import process from "process"
import rimraf from "rimraf"
import { copyFileSync, getFileList } from "./fileManager"

const clg = new ColorLog()

function install(dirName: string, option: Command) {
    let installPath: string =
        dirName == null
            ? path.resolve(process.cwd())
            : path.resolve(process.cwd(), dirName)

    if (fs.existsSync(installPath)) {
        clg.warn(`\n  ❌  The directory ${installPath} already exists.\n`)
        return
    }

    clg.join()
        .pri(`\n  Creating a new Node project in`)
        .suc(`${installPath}`)
        .pri("\n\n   [1/2] 🦍  Cloning project...")
        .log(
            option.targetRepo === undefined
                ? "Default sample"
                : option.targetRepo
        )
        .end()

    if (option.targetRepo !== undefined) {
        clg.warn(1)
        const targetRepo = option.targetRepo as string
        // Simple validation of inputted option.targetRepo string
        const isCorrectFormOfGitRepo = /^(https:\/\/|git@).*(.git)$/.test(
            targetRepo
        )

        if (!isCorrectFormOfGitRepo) {
            clg.warn(
                `\n  ❌  The url path for git repository ${targetRepo} is not valid form.\n`
            )
            return
        }

        exec(
            `git clone ${option.targetRepo} ${installPath}`,
            (error, stdout, stderr) => {
                if (error) {
                    clg.join()
                        .log("Error occurred while executing ")
                        .pri(`git clone ${option.targetRepo} ${installPath}`)
                        .warn(`error: ${error}`)
                        .end()
                    return
                }
                installNpmAndClosing(installPath)
                rimraf.sync(path.resolve(installPath, ".git"))
            }
        )
    } else {
        const targetPath = path.resolve(__filename, "../../sample/")
        const sampleFileList: string[] = getFileList(targetPath)
        const cache = {}

        for (let [index, file] of sampleFileList.entries()) {
            const fileDirname = path.dirname(file)
            const dirPathToInstall = path.resolve(installPath, fileDirname)

            if (!cache[fileDirname]) {
                fs.mkdirSync(dirPathToInstall)
                cache[fileDirname] = true
            }
            const fullPath = path.resolve(targetPath, file)

            copyFileSync(fullPath, dirPathToInstall)
        }

        installNpmAndClosing(installPath)
    }
}

function installNpmAndClosing(installPath: string) {
    clg.pri("  [2/2] 🍀  Installing packages...")

    // [0,1,2] is equivalent to [process.stdin, process.stdout, process.stderr]
    execSync("npm install", { stdio: [0, 1, 2], cwd: `${installPath}` })

    clg.join()
        .pri(`  ...\n\n  ✅  Node project is successfuly initialized !`)
        .info(`\n\n    cd`)
        .suc(`${installPath}`)
        .info(`\n    npm run dev `)
        .pri(`\n\n  ✨  Happy hacking\n`)
        .end()
}

program
    .version("0.0.1")
    .command("i [dir]")
    .option(
        "-t, --targetRepo <repository_url>",
        "Initial repository to install"
    )
    .action(install)

program.on("--help", function() {
    clg.join()
        .log("\nExamples:\n")
        .pri("  $ ")
        .log("node-starter i [project_name]\n\n")
        .pri("  $ ")
        .log("node-starter i [project_name] -t [repository_url]\n\n")
        .end()
})

program.parse(process.argv)
