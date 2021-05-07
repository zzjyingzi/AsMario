import { position, mapData} from "./interface";

interface mapParam {
    data : mapData;
    rolePosition : position;
    screen : [number, number];
}


export default class Map {
    data: mapData;
    rolePosition:[number, number];
    screen: [number, number];
    preMapData: mapData;
    constructor(param: mapParam) {
        this.data = param.data;
        this.rolePosition = param.rolePosition;
        this.screen = param.screen;
    }
    presentationMap() {
        const { data, rolePosition, screen } = this;
        const width = screen[0];
        const height = screen[1];


        // rolePosition为地图渲染中心点

        let range = data.filter((item)=>{
            return (item[0] >= (rolePosition[0] - width/2)) && (item[0] <= rolePosition[0] + width/2);
        });
        // 要考虑没有点
        if(!range.length ){
            range.unshift([rolePosition[0] - width/2, 0]);
            range.unshift([rolePosition[0] - width/2, height]);
            range.push([rolePosition[0] + width/2, 0]);
            range.push([rolePosition[0] + width/2, height]);
        } else if(range.length === 1){ // 一个点的状态
            range.unshift([rolePosition[0] - width/2, range[0][1]]);
            range.unshift([rolePosition[0] - width/2, height]);
            range.push([rolePosition[0] - width/2, range[0][1]]);
            range.push([rolePosition[0] - width/2, height]);
        } else{ // 多点
            if(range[0][0] > rolePosition[0] - width/2){ // 如果开头点与当前screenMap不重叠
                range.unshift([rolePosition[0] - width/2, range[0][1]]);
                range.unshift([rolePosition[0] - width/2, height]);
            }
            if(range[range.length - 1][0] < rolePosition[0] + width/2){ // 如果末尾点与当前screenMap不重叠
                range.push([rolePosition[0] + width/2, range[range.length - 1][1]]);
                range.push([rolePosition[0] + width/2, height]);
            }
        }

        // 此处重新创建map数据
        let screenMapPre:any = [];
        range.forEach((item)=>{
            const itemPre = [...item]
            itemPre[0] = itemPre[0] - rolePosition[0] + width/2;
            screenMapPre.push(itemPre);
        });

        this.preMapData = screenMapPre;
    }
}
