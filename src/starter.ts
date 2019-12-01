'use strict';
import { exec, execSync } from 'child_process';
import ColorLog from 'colorlog-css';
import program, { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import process from 'process';
import readline from 'readline';
import rimraf from 'rimraf';

import { copyFiles } from './fileManager';

// import mkdirp from 'mkdirp';
const clg = new ColorLog();
const fuckWindows = process.platform === 'win32';

function entry(dirName: string | null | undefined, option: Command) {
    let installPath: string = dirName == null ? path.resolve(process.cwd()) : path.resolve(process.cwd(), dirName);
    if (fs.existsSync(installPath)) {
        clg.warn(`\n  ❌  The directory ${installPath} already exists.\n`);
        return;
    }

    if (option.targetRepo !== undefined) {
        return installRemoteRepo(option.targetRepo, installPath);
    }

    exec(
        `curl -s https://github.com/delSibal/node_starter_samples/tree/master/server | grep 'class="js-navigation-open"'`,
        (err, stdout) => {
            if (err) return clg.danger(`❌ Failed to fetch from repository`);

            const result = stdout.match(/(?<=title=\").*(?=\"\sid)/gm);

            if (result === null) {
                clg.danger(`❌ Failed to fetch from repository`);
                return;
            }

            clg.pri(`  🌀 Choose the number of sample repository you want to clone.`);
            for (let i = 0; i < result.length; i++) {
                clg.log(`${i} - ${result[i]}`);
            }

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            let repoIdx: number = -999;
            function askRepo() {
                rl.question('-> ', function(idx) {
                    repoIdx = parseInt(idx, 10);
                    if (isNaN(repoIdx) || repoIdx < 0 || repoIdx >= result!.length) {
                        clg.warn(`❌ Choose right number`);
                        askRepo();
                        return;
                    }

                    clg.pri(` Started to install ${result![repoIdx]}`);

                    rl.close();
                });
            }

            askRepo();

            rl.on('close', function() {
                if (repoIdx < 0) return; // when user exit from terminal
                // process.exit(0);
                return installSampleRepo(result[repoIdx], installPath);
            });
        },
    );
}

function installLog(repoUrl: string, installPath: string) {
    clg.join()
        .pri(`\n  Creating a new Node project in`)
        .suc(`${installPath}`)
        .pri('\n\n   [1/2] 🦍  Cloning project...')
        .log(repoUrl)
        .end();
}

function installRemoteRepo(repoUrl: string, installPath: string) {
    installLog(repoUrl, installPath);
    // Simple validation of inputted option.repoUrl string
    const isCorrectFormOfGitRepo = /^(https:\/\/|git@).*(.git)$/.test(repoUrl);

    if (!isCorrectFormOfGitRepo) {
        clg.warn(`\n  ❌  The url path for git repository ${repoUrl} is not valid form.\n`);
        return;
    }

    exec(`git clone ${repoUrl} ${installPath}`, (error, stdout, stderr) => {
        if (error) {
            clg.join()
                .log('Error occurred while executing ')
                .pri(`git clone ${repoUrl} ${installPath}`)
                .warn(`error: ${error}`)
                .end();
            return;
        }
        installNpmAndClosing(installPath);
        rimraf.sync(path.resolve(installPath, '.git'));
    });
}

function installSampleRepo(selectedRepoName: string, installPath: string) {
    // console.log(`dirName : ${dirName}`);
    // console.log(dirName);
    // // console.log(path.resolve(process.cwd(), dirName));

    // console.log(`option : ${option}`);

    installLog(selectedRepoName, installPath);

    let repoToClone = 'git@github.com:delSibal/node_starter_samples.git';

    let cntOfFetching = 0;
    while (cntOfFetching < 2) {
        try {
            fetchSample(repoToClone, installPath, selectedRepoName);
        } catch (error) {
            clg.warn('[starter.install] fetchSample error :: ', error);

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

function installNpmAndClosing(installPath: string) {
    clg.pri('  [2/2] 🍀  Installing packages...');

    // [0,1,2] is equivalent to [process.stdin, process.stdout, process.stderr]
    execSync('npm install', { stdio: [0, 1, 2], cwd: `${installPath}` });

    // //  for test
    // console.log('✅ This is the whole files on the dir');
    // execSync(`ls -al ${installPath}`, { stdio: [0, 1, 2], cwd: `${installPath}` });

    clg.join()
        .pri(`  ...\n\n  ✅  Node project is successfuly initialized !`)
        .info(`\n\n    cd`)
        .suc(`${installPath}`)
        .info(`\n    npm run dev `)
        .pri(`\n\n  ✨  Happy hacking\n`)
        .end();
}

function fetchSample(repoURL: string, destPath: string, selectedRepoName: string) {
    // console.log('fuckWindows : ', fuckWindows);
    // console.log('repoURL : ', repoURL);
    // console.log('destDirName : ', destDirName);
    // console.log('fs.existsSync(destDirName) : ', fs.existsSync(destDirName));

    if (fs.existsSync(destPath) === false) {
        fs.mkdirSync(destPath);
    }

    execSync('git init', { cwd: `${destPath}` });
    execSync(`git remote add -f origin ${repoURL}`, { cwd: `${destPath}` });

    // Only fetch `server/${selectedRepoName}` directory from repository
    execSync(`git config core.sparseCheckout true`, { cwd: `${destPath}` });
    if (fuckWindows) {
        fs.createWriteStream(path.resolve('destPath', '.git/info/sparse-checkout'), { encoding: 'utf8' }).write(
            `server/${selectedRepoName}`,
        );
    } else {
        execSync(`echo server/${selectedRepoName} > .git/info/sparse-checkout`, { cwd: `${destPath}` });
    }

    execSync(`git pull origin master`, { cwd: `${destPath}` });

    const installedPath = path.resolve(destPath, `server/${selectedRepoName}`);

    if (fuckWindows) {
        // mkdirp.sync(destPath);

        copyFiles(installedPath, destPath, () => {
            installNpmAndClosing(destPath);
            rimraf.sync(path.resolve(destPath, './git'));
            rimraf.sync(path.resolve(destPath, 'server'));
        });
    } else {
        // Add `-p` to avoid error when dir exists
        // execSync(`mkdir -p ${destPath}`, { cwd: `${destPath}` });

        // Assume that existing files are copied safely. If not, this might need to delete ${destPath} folder before moving.
        execSync(`mv -n $(ls -A) ${destPath}`, {
            cwd: `${installedPath}`,
        });
        installNpmAndClosing(destPath);
        execSync(`rm -rf .git server`, { cwd: `${destPath}` });
    }
}

program
    .version('0.1.22')
    .command('i [dir]')
    .option('-t, --targetRepo <repository_url>', 'Initial repository to install')
    .action(entry);

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
