import fs from 'fs';
import path from 'path';

type ErrorProneFunction = (e?: any) => any;
type CustomFunction = () => any;

// https://stackoverflow.com/a/14387791/5260068
function copyFile(srcFile: fs.PathLike, dstFile: fs.PathLike, cb: ErrorProneFunction) {
    // If file doesn't exist
    if (fs.existsSync(srcFile) === false) {
        return cb(`[copyFile] File does not exist:: ${srcFile}`);
    }

    const destDirPath = path.dirname(dstFile as string);
    if (fs.existsSync(destDirPath) === false) {
        console.log(`[copyFile] Dest file directory does not exist:: ${dstFile} :: ${destDirPath}`);
        try {
            fs.mkdirSync(destDirPath);
        } catch (e) {
            return cb(`[copyFile] Failed to create file:: ${e}`);
        }
    }

    let rd = fs.createReadStream(srcFile);
    rd.on('data', function(chunk) {
        // console.log('[copyFile] chunk : ', chunk);
    });
    rd.on('error', function(err) {
        // console.log('[copyFile] rd: err', err);
        done(err);
    });

    // rd.on('close', function() {
    // ReadStream has been destroyed and file has been closed
    // console.log('[copyFile] rd: close');
    // })

    let wr = fs.createWriteStream(dstFile);
    wr.on('error', function(err) {
        // console.log('[copyFile] wr: err', err);
        done(err);
    });
    wr.on('close', function() {
        // console.log('[copyFile] wr: close');
        done();
    });

    // pipe
    rd.pipe(wr);

    function done(err?: any) {
        cb(err);
        rd.destroy();
        wr.destroy();
    }
}

// ref: https://stackoverflow.com/a/49601340/5260068
function readFilesRecursivelySync(dir: string) {
    const files: [[string, string]?] = [];
    const mapDir = {};

    const readFile = (dir: fs.PathLike, prefix: null | string = null) => {
        fs.readdirSync(dir).forEach(filename => {
            // console.log(' filename :: ', filename);
            // const name = path.parse(filename).name;
            // const ext = path.parse(filename).ext;
            const filepath = path.resolve(dir as string, filename);
            const stat = fs.statSync(filepath);
            const isFile = stat.isFile();
            const filenameWithPrefix = prefix === null ? filename : `${prefix}/${filename}`;

            if (isFile) {
                let tmp = [];
                if (prefix) {
                    files.push();
                }
                files.push([filepath, filenameWithPrefix]);
            } else {
                // console.log(filepath);
                if (mapDir[filepath] === undefined) {
                    mapDir[filepath] = true;
                    readFile(filepath, filenameWithPrefix);
                }
            }
        });
    };

    readFile(dir);

    return files;
}

function copyFiles(srcDir: string, destDir: string, cb: null | CustomFunction = null) {
    const fileListToCopy = readFilesRecursivelySync(srcDir);

    fileListToCopy.forEach(file => {
        copyFile(file![0], destDir + '/' + file![1], e => {
            if (e) {
                console.log('Error occurred while copy files:: ', e);
                return;
            }
        });
    });

    cb && cb();
}

export { copyFiles };
