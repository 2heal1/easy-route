import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { Compiler } from 'webpack'
const easyRoute = require('./easyRouting.js')

interface GenerateConfig {
  pages: string
  importPrefix?: string
  dynamic?: boolean
  chunkNamePrefix?: string
}

const pluginName = 'VueEasyRoutingPlugin'

interface Options extends GenerateConfig { }

namespace VueEasyRoutingPlugin {
  export type AutoRoutingOptions = Options
}

class VueEasyRoutingPlugin {
  constructor(private options: Options) {
    assert(options.pages, '`pages` is required')
  }

  apply(compiler: Compiler) {
    const generate = () => {
      const code = easyRoute.generateRoutes(this.options)
      const to = path.resolve(__dirname, '../index.js')

      if (
        fs.existsSync(to) &&
        fs.readFileSync(to, 'utf8').trim() === code.trim()
      ) {
        return
      }
      fs.writeFileSync(to, code)
    }
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      try {
          generate()
      } catch (err) {
          compilation.errors.push(err)
      }
  })
  }
}

export = VueEasyRoutingPlugin
