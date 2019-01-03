import fs from 'fs'
import path from 'path'

export const copyFileSync = (source: string, targetFolder: string) => {
  let targetFile = targetFolder

  if (fs.existsSync(targetFolder)) {
    if (fs.lstatSync(targetFolder).isDirectory()) {
      targetFile = path.join(targetFolder, path.basename(source))
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source))
}

const ignore = {
  'src/copyFolder.ts': true,
  'src/starter.ts': true,
  '.git': true,
  node_modules: true,
  build: true
}

export const getFileList = (
  targetPath: string,
  list: string[] = [],
  base: string = ''
): string[] => {
  let tmp = fs.readdirSync(targetPath).map(e => path.join('', e))
  for (let i = 0; i < tmp.length; i++) {
    let currentPath = tmp[i]
    if (ignore[currentPath]) {
      tmp.splice(i, 1)
      i--
      continue
    }

    if (fs.lstatSync(path.join(targetPath, currentPath)).isDirectory()) {
      tmp.splice(i, 1)
      const tmpLen = tmp.length
      tmp = getFileList(path.join(targetPath, currentPath), tmp, currentPath)

      i = tmp.length > tmpLen ? tmp.length - 1 : i - 1
    }
  }

  list = [...list, ...tmp.map(e => path.join(base, e))]
  return list
}
