var fs = require('fs');
var fg = require('fast-glob');
const generate = require('./generaRoutes.js');
const resolve = require('./resolve.js');
const generatePagePath = require('./generatePage.js');
const removeNested = require('./removeArr');
var path = require('path');
function generateRoutes({ pages, importPrefix = '@/pages/', dynamic = true, chunkNamePrefix = '', redirectPath = 'index' }) {
    // 设置页面筛选正则
    const patterns = ['**/*.vue', '!**/__*__.vue', '!**/__*__/**'];
    // 生成路径名
    const pagePaths = fg.sync(patterns, {
        cwd: pages,
        onlyFiles: false
    });
    const pagePath = generatePagePath.generatePage(pagePaths, false, '');
    let hasLayout = pagePath.find(item => {
        return item.path.match(/^_/) !== null;
    });
    let metaList = resolve.resolveMeta(pagePath, importPrefix, false, '', false, hasLayout ? 0 : 1, file => {
        return fs.readFileSync(path.join(pages, file), 'utf8');
    }).filter(item => item);
    let cur = [...metaList];
    cur.forEach((item, index) => {
        removeNested.removeArr(metaList, item, index);
    });
    return generate.createRoutes(metaList, dynamic, chunkNamePrefix, redirectPath);
}
exports.generateRoutes = generateRoutes;
