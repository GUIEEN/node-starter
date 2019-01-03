import util from 'util'

// stdout without newline
class Log {
  log = (...args: string[]) =>
    process.stdout.write(util.format.apply(this, args))

  pre = (
    prefix: string,
    colorMe: string,
    color: string = '\x1b[36m%s\x1b[0m'
  ) => {
    this.log(prefix)
    process.stdout.write(util.format.apply(this, [color, colorMe]))
  }

  post = (
    colorMe: string,
    postfix: string,
    color: string = '\x1b[36m%s\x1b[0m'
  ) => {
    process.stdout.write(util.format.apply(this, [color, colorMe]))
    this.log(postfix)
  }
}

export default Log
