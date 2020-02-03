// TODO:嵌套数组 不知道确切写法
interface MetaList<T> extends Array<T | MetaList<T>> { }
const prettier = require("prettier");
function createRoute(meta:any) {
    if (!meta) return 'null';
    const routeName = `name: '${meta.name}'`;
    const metaRoutes = meta.routeMeta ? `,meta: ${JSON.stringify(meta.routeMeta, null,0)}` : '';
    const child:any = meta.children ? `,children:${JSON.stringify(meta.children.map(createRoute), null, 2).replace(/\\n/g, '').replace(/\\/g, '').replace(/"null"/g,'easyRoutingbyHeal').replace(/" /g,'').replace(/}"/g,'}')}` : '';
    if (meta instanceof Array) {
        return 'null';
    }
    return `
    {
        ${routeName},
        path:'${meta.isParent ? '/' : ''}${meta.path}',
        component:${meta.specifier}${metaRoutes}${child}
    }`;
}
function createImport(meta:any, dynamic:boolean, chunkNamePrefix:string) {
    let child = null;
    if (!meta)
        return 'null';
    if (meta.children) {
        child = meta.children.map((item:any) => createImport(item, dynamic, chunkNamePrefix));
    }
    if (meta instanceof Array) {
        return 'null';
    }
    const code = dynamic
        ? `function ${meta.specifier}() { return import(/* webpackChunkName: "${chunkNamePrefix}${meta.name}" */ '${meta.component}') }  ${meta.children ? child.join('\n') : ''}`
        : `import ${meta.specifier} from '${meta.component}'  ${meta.children ? child.join('\n') : ''}`;
    return code;
}
function createRoutes(metaList:any, dynamic:boolean, chunkNamePrefix:string, redirectPath:string) {
    const code = metaList.map(createRoute);
    code.push(`
    {
        path: '/',
        redirect: '/${redirectPath}'
    }`);
    const routes = code.join(',').replace(/easyRoutingbyHeal,/g, '');
    const imports = metaList.map((item:any) => createImport(item, dynamic, chunkNamePrefix)).join('\n').replace(/null/g, '');
    return prettier.format(`${imports}\n\nexport default [${routes}]`, {
        parser: 'babel',
        semi: false,
        singleQuote: true
    });
}
exports.createRoutes = createRoutes;
