# TS/JS project starter

<div align="center">

[![npm version](https://badge.fury.io/js/%40guieen%2Fnode-starter.svg)](https://www.npmjs.com/package/@guieen/node-starter)
[![LICENSE](https://img.shields.io/github/license/GUIEEN/node-starter.svg)](https://github.com/GUIEEN/node-starter/blob/master/LICENSE)

</div>

🏳️‍🌈 Simple TS/JS project starter!

No more annoying tedious `npm install -D @types/~` for starting your new project.

This module will let you start coding without configuration and installing packages. All you need to do is set your initial state of repository (or you can use my [sample node server](https://github.com/delSibal/node_starter_samples)) and type the `node-starter` cli command.

By default, simple node-server will be created. You can also use your repository to set an initial state of node project.

Happy coding ✨

### Contribute your starter repositories ==> [node_starter_samples repository](https://github.com/delSibal/node_starter_samples)

## Install

```bash
npm install @guieen/node-starter -g
```

## Basic Usage

```bash
Usage: node-starter [options] [command]

Options:
  -V, --version      output the version number
  -h, --help         output usage information

Commands:
  i [options] [dir]

Examples:
  $ node-starter i [project_name]
  $ node-starter i [project_name] -t [repository_url]
```

```bash
node-starter i [project_name]
node-starter i [project_name] -t [repository_url]

# This will create `my-app` dir and clone & install packages of default / another repository you set
node-starter i my-app
node-starter i my-app -t https://github.com/GUIEEN/node-starter
```

-   repository_url : You can set any git repository to use as a starter kit

## TediousTediousTediousTediousTediousTediousTedious... :|

<div align="center">

![alt text](https://i2.wp.com/workschoolenglish.com/wp-content/uploads/2016/01/tedious.png?resize=480%2C320&ssl=1)

</div>

## Update

-   Fix the issues with installing

## Todo...

-   [x] Make a page for this module and let ppl share their customized initial repositories :)
-   [ ] Show available starter samples in repositories with CLI
-   [ ] Select the lint configuration before installing application and apply it after project is installed.
-   [ ] ...

<div align="center">

These are the features of what I'm thinking to do in near future ✨

How do you guys think ? Any feedback would be welcome 🍀

</div>
