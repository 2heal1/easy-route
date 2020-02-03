
const compiler = require("vue-template-compiler");
const routeMetaName = 'route-meta'

interface PagePath {
    path: string,
    children: Array<PagePath> | null,
    parent: string | null
}
interface RouteMetaBlock{
    type:string,
    content:string,
    start:number,
    end:number,
    attrs:object
}
function resolveMeta(pagePaths: Array<PagePath>, importPrefix:string,hasParent: boolean, layoutPath: string, layoutChild: boolean, lastParentLevel: number, readFile: any): any {
    let layout: PagePath | undefined = pagePaths.find(item => {
        return item.path.match(/^_/) !== null
    })
    if (layout) {
        let parentSplit: string[] |null = layout.parent ? layout.parent.split('/') : null
        let noLayoutPath :string = layout.parent + '/' + layout.path
        if (lastParentLevel) {
            noLayoutPath = parentSplit ? parentSplit.slice(lastParentLevel - 1).join('/') + '/' + layout.path :''
        }
        if (layout.parent && layout.parent.length) {
            layout.path = layout.parent + '/' + layout.path
        }
        // 获取文件名
        let filePath = basename(layout.path)
        noLayoutPath = parentSplit && parentSplit.length >= 2 ? noLayoutPath : filePath
        let pathArray = filePath.split('/')
        if (hasRoute(getLastName(pathArray))) return null
        const meta :any= {
            component: `${importPrefix}${layout.path}`,
            name: getKebabCaseName(pathArray),
            path: basename(noLayoutPath).replace(/\$/g, ':').replace(/_/g, ''),
            specifier: pathToSpecifier(pathArray),
            hasParent,
            isParent: layoutPath.length ? false : true
        }
        const content = readFile(layout.path); //获取文件内容
        const parsed = compiler.parseComponent(content);// 通过vue-template-compiler将vue内容转化为5块内容：template script styles customBlocks errors
        const routeMetaBlock = parsed.customBlocks.find(
            (b:RouteMetaBlock) => b.type === routeMetaName
        )
        if (routeMetaBlock) {
            try {
                meta.routeMeta = JSON.parse(routeMetaBlock.content)
            } catch (err) {
                const wrapErr:any = new Error('Invalid json format of <route-meta> content about ' + err.message);
                wrapErr.file = layout.path
                throw wrapErr
            }
        }
        let curArr = pagePaths.filter(item => {
            return item !== layout
        })
        let childrenLayoutPath = filePath.replace(/\$/g, ':').replace(/_/g, '')
        meta.children = resolveMeta(curArr,importPrefix, true, childrenLayoutPath, true, lastParentLevel + 1, readFile)
        return [meta]
    } else {
        return pagePaths.map(item => {
            if (item.children) {
                return resolveMeta(item.children,importPrefix, true, layoutPath, false, lastParentLevel, readFile)
            } else {
                let truePath = item.path
                let parentSplit: string[] | null  = item.parent?item.parent.split('/'):null
                let noLayoutPath:string | null  = parentSplit && parentSplit.slice(1).join('/') + '/' + item.path
                if (item.parent && item.parent.length) {
                    item.path = item.parent + '/' + item.path
                }
                // 获取文件名
                let filePath = basename(item.path)
                noLayoutPath =  parentSplit && parentSplit.length >= 2 ? noLayoutPath : filePath
                let pathArray = filePath.split('/')
                if (hasRoute(getLastName(pathArray))) return null
                const meta :any= {
                    component: `${filePath}`,
                    name: getKebabCaseName(pathArray),
                    path: layoutChild ? basename(truePath).replace(/\$/g, ':').replace(/_/g, '') : basename(noLayoutPath?noLayoutPath:'').replace(/\$/g, ':').replace(/_/g, ''),
                    specifier: pathToSpecifier(pathArray),
                    hasParent,
                    isParent: layoutPath.length ? false : true
                }
                const content = readFile(item.path); //获取文件内容
                const parsed = compiler.parseComponent(content);// 通过vue-template-compiler将vue内容转化为5块内容：template script styles customBlocks errors
                const routeMetaBlock = parsed.customBlocks.find(
                    (b:RouteMetaBlock) => b.type === routeMetaName
                )
                if (routeMetaBlock) {
                    try {
                        meta.routeMeta = JSON.parse(routeMetaBlock.content)
                    } catch (err) {
                        const wrapErr:any = new Error('Invalid json format of <route-meta> content about ' + err.message);
                        wrapErr.file = item.path
                        throw wrapErr
                    }
                }
                return meta
            }

        })
    }
}

// 生成风格为 kebab-case的名字 并去除前缀
function getKebabCaseName(segments:string[]) {
    return segments
        .map(s => {
            return s[0] === '_' ? s.slice(1) : s;
        })
        .join('-');
}
// 根据后缀是否带有$判断是否需要有路由
function hasRoute(segments:string) {
    return segments[segments.length - 1] === '$' ? true : false
}
function getLastName(segments:string[]) {
    return segments[segments.length - 1]
}
function pathToSpecifier(segments:string[]) {
    const name = getKebabCaseName(segments);
    const replaced = name
        .replace(/(^|[^a-zA-Z])([a-zA-Z])/g, (_, a, b) => {
            return a + b.toUpperCase();
        })
        .replace(/[^a-zA-Z0-9]/g, '');
    return /^\d/.test(replaced) ? '_' + replaced : replaced;
}
// 去除.vue
function basename(filename:string) {
    return filename.replace(/\..+?$/, '');
}
exports.resolveMeta = resolveMeta;