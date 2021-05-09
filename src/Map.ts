import { position, mapData} from "./interface";

interface mapParam {
    data : mapData;
    position : position;
    screen : [number, number];
    velocity: [number, number];
}


export default class Map {
    data: mapData;
    position:[number, number];
    screen: [number, number];
    preMapData: mapData;
    velocity: [number, number];
    constructor(param: mapParam) {
        this.data = param.data;
        this.position = param.position;
        this.screen = param.screen;
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
    moveMap(newRole:any, app:any){
        const { button, positionX } = newRole;
        const { velocity, data, screen, position } = this;
        const { space, right, left } = button;
        // 当前运行速度,注意跳跃进度会影响
        const lastMiddle = data[data.length - 1][0] - screen[0]/2;

        // 按键规则对map速度的影响
        this.velocity[0] = right ? velocity[0] :(left ? -velocity[0] : 0);


        // newRole.mapVelocity = velocity[0]; // 传递参数到role
        // x 方移动Y轴，map渲染位置改变,
        // 已有正向，反向？？？   |---|-------------|---|
        // 左端---前端半屏界限----中间段----后端半屏---右端

        const mapMiddleX = position[0];
        //
        // if(mapMiddleX > positionX && (mapMiddleX > screen[0]/2 && mapMiddleX < lastMiddle)){ // 前半区间内
        //
        // }

        if(positionX < screen[0]/2){ // 前端区间
            this.velocity[0] = 0;
            this.position[0] = screen[0]/2;
        } else if(positionX === screen[0]/2){ // 注意,如果不等无法启动地图移动动画,隐含条件是只有role中的newX在中间段停止后,此处动画才会启动
            if(velocity[0] >= 0){ // 临界状态，v方向为正则移动map为负则移动role
                this.velocity[0] = right ? velocity[0] :(left ? -velocity[0] : 0);
                this.position[0] = position[0] + this.velocity[0];
            } else {
                newRole.velocity[0] = app.velocity[0];
                this.position[0] = screen[0]/2;
            }
        } else if(position[0] > screen[0]/2 && position[0] < lastMiddle){ // 中间段
            newRole.velocity[0] = 0;
            this.position[0] = position[0] + velocity[0];  // map最大尺寸
        } else if(position[0] === lastMiddle){ // 此处突然加速???原因:map和role叠加速度，叠加速度是因为区间判断不准确
            this.position[0] = lastMiddle;
            newRole.velocity[0] = velocity[0];
        } else if(positionX > lastMiddle){  // 尾部区间
            this.velocity[0] = 0;
            this.position[0] = lastMiddle + velocity[0];
        }
        newRole.mapPosition[0] = position[0]; // 存储变革数据到role中
    };
}
