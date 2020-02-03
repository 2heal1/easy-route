var fs = require('fs')
var fg = require('fast-glob')
const path = require("path");
const generate = require('./generaRoutes.js')
const resolve = require('./resolve.js')
const generatePagePath = require('./generatePage.js')
const removeNested = require('./removeArr')

interface PageOptions {
    pages: string,
    menuCode: string,
    redirectPath: string,
    importPrefix:string,
    dynamic:boolean,
    chunkNamePrefix:string
}
interface PagePath {
    path: string,
    children: Array<PagePath> | null,
    parent: string | null
}
// TODO:嵌套数组 不知道确切写法
interface MetaList<T> extends Array<T | MetaList<T>> { }

interface ResolveMetaOptions {
    pagePaths: Array<PagePath>,
    hasParent: boolean,
    layoutPath: string,
    layoutChild: boolean,
    lastParentLevel: number,
    readFile: any
}

function generateRoutes({ pages, importPrefix = '@/pages/', dynamic = true, chunkNamePrefix = '', redirectPath = 'index' }: PageOptions) {
    // 设置页面筛选正则
    const patterns: string[] = ['**/*.vue', '!**/__*__.vue', '!**/__*__/**']
    // 生成路径名
    const pagePaths: string[] = fg.sync(patterns, {
        cwd: pages,
        onlyFiles: true
    })
    const pagePath: Array<PagePath> = generatePagePath.generatePage(pagePaths, false, '')
    let hasLayout: PagePath | undefined = pagePath.find(item => {
        return item.path.match(/^_/) !== null
    })
    let metaList: MetaList<[] | {
        component: string
        name: string
        path: string,
        specifier: string,
        hasParent: boolean,
        isParent: boolean,
        routeMeta?: any
    }> = resolve.resolveMeta(pagePath, importPrefix,false, '', false, hasLayout ? 0 : 1, (file: any) => {
        return fs.readFileSync(path.join(pages, file), 'utf8');
    }).filter((item: MetaList<[] | {
        component: string
        name: string
        path: string,
        specifier: string,
        hasParent: boolean,
        isParent: boolean,
        routeMeta?: any
    }>) => item)
    let cur = [...metaList]
    cur.forEach((item, index) => {
        removeNested.removeArr(metaList, item, index)
    })
    return generate.createRoutes(metaList, dynamic, chunkNamePrefix, redirectPath)
}
exports.generateRoutes = generateRoutes