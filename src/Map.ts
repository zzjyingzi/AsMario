import { position, mapData} from "./interface";

interface mapParam {
    data : mapData;
    position : position;
    screen : [number, number];
    velocity: [number, number];
}


export default class Map {
    data: mapData;
    preMapData: mapData;
    position: position;
    screen: [number, number];
    velocity: [number, number];
    constructor(param: mapParam) {
        this.data = param.data;
        this.position = param.position;
        this.screen = param.screen;
        this.velocity = [0, 0];
    }

    // 当前map在屏幕的映像
    presentationMap() {
        const { data, position, screen } = this;
        const width = screen[0];
        const height = screen[1];


        // position为地图渲染中心点

        let range = data.filter((item)=>{
            return (item[0] >= (position[0] - width/2)) && (item[0] <= position[0] + width/2);
        });
        // 要考虑没有点
        if(!range.length ){
            range.unshift([position[0] - width/2, 0]);
            range.unshift([position[0] - width/2, height]);
            range.push([position[0] + width/2, 0]);
            range.push([position[0] + width/2, height]);
        } else if(range.length === 1){ // 一个点的状态
            range.unshift([position[0] - width/2, range[0][1]]);
            range.unshift([position[0] - width/2, height]);
            range.push([position[0] - width/2, range[0][1]]);
            range.push([position[0] - width/2, height]);
        } else{ // 多点
            if(range[0][0] > position[0] - width/2){ // 如果开头点与当前screenMap不重叠
                range.unshift([position[0] - width/2, range[0][1]]);
                range.unshift([position[0] - width/2, height]);
            }
            if(range[range.length - 1][0] < position[0] + width/2){ // 如果末尾点与当前screenMap不重叠
                range.push([position[0] + width/2, range[range.length - 1][1]]);
                range.push([position[0] + width/2, height]);
            }
        }

        // 此处重新创建map数据
        let screenMapPre:any = [];
        range.forEach((item)=>{
            const itemPre = [...item]
            itemPre[0] = itemPre[0] - position[0] + width/2;
            screenMapPre.push(itemPre);
        });

        this.preMapData = screenMapPre;
    }

    // 移动map函数独立出来
    moveMap(){
        const { velocity, position } = this;
        this.position[0] = position[0] + velocity[0];
    };
}
