const prettier = require("prettier");
function createRoute(meta) {
    if (!meta)
        return 'null';
    const routeName = `name: '${meta.name}'`;
    const metaRoutes = meta.routeMeta ? `,meta:${JSON.stringify(meta.routeMeta, null, 2)}` : '';
    const child = meta.children ? `,children:${JSON.stringify(meta.children.map(createRoute), null, 2).replace(/\\n/g, '').replace(/\\"/g, '').replace(/"/g, '')}` : '';
    if (meta instanceof Array) {
        return 'null';
    }
    return `
    {
        ${routeName},
        path:'${meta.isParent ? '/' : ''}${meta.path}',
        component:${meta.specifier}
        ${metaRoutes}
        ${child}
    }`;
}
function createImport(meta, dynamic, chunkNamePrefix) {
    let child = null;
    if (!meta)
        return 'null';
    if (meta.children) {
        child = meta.children.map(item => createImport(item, dynamic, chunkNamePrefix));
    }
    if (meta instanceof Array) {
        return 'null';
    }
    const code = dynamic
        ? `function ${meta.specifier}() { return import(/* webpackChunkName: "${chunkNamePrefix}${meta.name}" */ '${meta.component}') }  ${meta.children ? child.join('\n') : ''}`
        : `import ${meta.specifier} from '${meta.component}'  ${meta.children ? child.join('\n') : ''}`;
    return code;
}
function createRoutes(metaList, dynamic, chunkNamePrefix, redirectPath) {
    const code = metaList.map(createRoute);
    code.push(`
    {
        path: '/',
        redirect: '/${redirectPath}'
    }`);
    const routes = code.join(',').replace(/null,/g, '');
    const imports = metaList.map(item => createImport(item, dynamic, chunkNamePrefix)).join('\n').replace(/null/g, '');
    return prettier.format(`${imports}\n\nexport default [${routes}]`, {
        parser: 'babel',
        semi: false,
        singleQuote: true
    });
}
exports.createRoutes = createRoutes;
