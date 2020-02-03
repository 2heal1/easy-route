interface PagePath {
    path: string
    children: Array<PagePath> | null
    parent: string | null
}
function generatePage(pagePaths: string[], second: boolean, parentPath: string) {
    var result: Array<PagePath> = []
    var newMap = new Map()
    var mapLength: number = 0
    if (!(pagePaths.length > 0)) return result
    if (second) {
        pagePaths = pagePaths.map((item: string) => {
            return item.split('/').slice(1).join('/')
        })
        pagePaths.forEach((item: string) => {
            if (item.split('/')[0].match('.vue') === null) {
                let value: string[] | undefined = newMap.get(item.split('/')[0])
                if (value) {
                    value.push(item)
                } else {
                    value = [item]
                }
                newMap.set(item.split('/')[0], value)
                mapLength++
            }
        })
        let curArr: string[] = pagePaths.filter(item => {
            return item.split('/')[0].match('.vue') !== null
        })
        for (let i = 0; i < curArr.length; i++) {
            result.push({
                path: curArr[i],
                children: null,
                parent: parentPath
            })
        }
        if (mapLength) {
            newMap.forEach((item) => {
                result.push({
                    path: item[0].split('/')[0],
                    children: generatePage(item, true, parentPath + '/' + item[0].split('/')[0]),
                    parent: parentPath
                })
            })
        }

    } else {
        pagePaths.forEach((item: string) => {
            if (item.split('/')[0].match('.vue') === null) {
                let value: string[] | undefined = newMap.get(item.split('/')[0])
                if (value) {
                    value.push(item)
                } else {
                    value = [item]
                }
                newMap.set(item.split('/')[0], value)
            }
        })
        let curArr: string[] = pagePaths.filter(item => {
            return item.split('/')[0].match('.vue') !== null
        })
        for (let i = 0; i < curArr.length; i++) {
            result.push({
                path: curArr[i],
                children: null,
                parent: parentPath
            })
        }
        newMap.forEach(item => {
            result.push({
                path: item[0].split('/')[0],
                children: generatePage(item, true, item[0].split('/')[0]),
                parent: parentPath
            })
        })
    }
    return result
}
exports.generatePage = generatePage


