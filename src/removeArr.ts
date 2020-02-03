// TODO:嵌套数组ts不清楚
function removeArr(parentData:any, data:any, index:number) {
    if (data instanceof Array) {
        if (data.length !== 1) {
            data.forEach((childItem, childIndex) => {
                removeArr(parentData[index], childItem, childIndex);
            });
        }
        if (data[0] && data[0].children) {
            data[0].children.forEach((item:any, childrenIndex:number) => {
                removeArr(parentData[index][0].children, item, childrenIndex);
            });
        }
        let curArr = data;
        parentData.splice(index, 1);
        parentData.splice(index, 0, []);
        parentData.push(...curArr);
    }
    if (data && data.children) {
        data.children.forEach((item:any, childrenIndex:number) => {
            removeArr(parentData[index].children, item, childrenIndex);
        });
    }
    return;
}
exports.removeArr = removeArr;