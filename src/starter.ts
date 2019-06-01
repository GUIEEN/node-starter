'use strict';
import { exec, execSync } from 'child_process';
import ColorLog from 'colorlog-css';
import program, { Command } from 'commander';
import fs from 'fs-extra';
// import mkdirp from 'mkdirp';
import path from 'path';
import process from 'process';
import rimraf from 'rimraf';

import { copyFiles } from './fileManager';

const clg = new ColorLog();
const fuckWindows = process.platform === 'win32';

function install(dirName: string | null | undefined, option: Command) {
    let installPath: string = dirName == null ? path.resolve(process.cwd()) : path.resolve(process.cwd(), dirName);

    if (fs.existsSync(installPath)) {
        clg.warn(`\n  ❌  The directory ${installPath} already exists.\n`);
        return;
    }

    clg.join()
        .pri(`\n  Creating a new Node project in`)
        .suc(`${installPath}`)
        .pri('\n\n   [1/2] 🦍  Cloning project...')
        .log(option.targetRepo === undefined ? 'Default sample' : option.targetRepo)
        .end();

    let repoToClone = 'git@github.com:delSibal/node_starter_samples.git';

    if (option.targetRepo !== undefined) {
        const targetRepo = option.targetRepo as string;
        // Simple validation of inputted option.targetRepo string
        const isCorrectFormOfGitRepo = /^(https:\/\/|git@).*(.git)$/.test(targetRepo);

        if (!isCorrectFormOfGitRepo) {
            clg.warn(`\n  ❌  The url path for git repository ${targetRepo} is not valid form.\n`);
            return;
        }

        exec(`git clone ${option.targetRepo} ${installPath}`, (error, stdout, stderr) => {
            if (error) {
                clg.join()
                    .log('Error occurred while executing ')
                    .pri(`git clone ${option.targetRepo} ${installPath}`)
                    .warn(`error: ${error}`)
                    .end();
                return;
            }
            installNpmAndClosing(installPath);
            rimraf.sync(path.resolve(installPath, '.git'));
        });
    } else {
        let cntOfFetching = 0;

        while (cntOfFetching < 2) {
            try {
                fetchSample(repoToClone, installPath);
            } catch (error) {
                console.log('[starter.install] fetchSample error :: ', error);

                if (fuckWindows) {
                    rimraf.sync(path.resolve(installPath, './git'));
                    rimraf.sync(path.resolve(installPath, 'server'));
                } else {
                    execSync(`rm -rf .git server`, { cwd: `${installPath}` });
                }

                cntOfFetching++;
                continue;
            }

            cntOfFetching = 2;
        }
    }
}

function installNpmAndClosing(installPath: string) {
    clg.pri('  [2/2] 🍀  Installing packages...');

    // [0,1,2] is equivalent to [process.stdin, process.stdout, process.stderr]
    execSync('npm install', { stdio: [0, 1, 2], cwd: `${installPath}` });

    clg.join()
        .pri(`  ...\n\n  ✅  Node project is successfuly initialized !`)
        .info(`\n\n    cd`)
        .suc(`${installPath}`)
        .info(`\n    npm run dev `)
        .pri(`\n\n  ✨  Happy hacking\n`)
        .end();
}

function fetchSample(repoURL: string, destDirName: string) {
    // console.log('fuckWindows : ', fuckWindows);
    // console.log('repoURL : ', repoURL);
    // console.log('destDirName : ', destDirName);
    // console.log('fs.existsSync(destDirName) : ', fs.existsSync(destDirName));

    if (fs.existsSync(destDirName) === false) {
        fs.mkdirSync(destDirName);
    }

    execSync('git init', { cwd: `${destDirName}` });
    execSync(`git remote add -f origin ${repoURL}`, { cwd: `${destDirName}` });

    // Only fetch `server/base_dotenv` directory from repository
    execSync(`git config core.sparseCheckout true`, { cwd: `${destDirName}` });
    if (fuckWindows) {
        fs.createWriteStream(path.resolve('destDirName', '.git/info/sparse-checkout'), { encoding: 'utf8' }).write(
            'server/base_dotenv',
        );
    } else {
        execSync(`echo server/base_dotenv > .git/info/sparse-checkout`, { cwd: `${destDirName}` });
    }

    execSync(`git pull origin master`, { cwd: `${destDirName}` });

    if (fuckWindows) {
        // mkdirp.sync(destDirName);

        copyFiles(path.resolve(destDirName, 'server/base_dotenv/*'), path.resolve(destDirName), () => {
            installNpmAndClosing(destDirName);
            rimraf.sync(path.resolve(destDirName, './git'));
            rimraf.sync(path.resolve(destDirName, 'server'));
        });
    } else {
        // Add `-p` to avoid error when dir exists
        // execSync(`mkdir -p ${destDirName}`, { cwd: `${destDirName}` });

        // Assume that existing files are copied safely. If not, this might need to delete ${destDirName} folder before moving.
        execSync(`mv -n ${path.resolve(destDirName, 'server/base_dotenv/*')} ${path.resolve(destDirName)}`, {
            cwd: `${destDirName}`,
        });

        installNpmAndClosing(destDirName);

        execSync(`rm -rf .git server`, { cwd: `${destDirName}` });
    }
}

program
    .version('0.1.22')
    .command('i [dir]')
    .option('-t, --targetRepo <repository_url>', 'Initial repository to install')
    .action(install);

program.on('--help', function() {
    clg.join()
        .log('\nExamples:\n')
        .pri('  $ ')
        .log('node-starter i [project_name]\n\n')
        .pri('  $ ')
        .log('node-starter i [project_name] -t [repository_url]\n\n')
        .end();
});

program.parse(process.argv);
