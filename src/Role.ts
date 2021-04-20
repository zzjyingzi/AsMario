import {slowDown, frameCounter} from './util_speedY'
import {keyStatus} from './enumStatus';
import {approximatelyEqual, compareNearPoint} from './util_math'

interface initialData{
    x:number;
    y:number;
    horizon:number;
    map:Array<Array<number>>,
    v: number,
    roleWidth: number;
    roleHeight: number;
    tempHorizon: number;
}

// 组合键开关接口
interface button{
    space: keyStatus;
    left: keyStatus;
    right: keyStatus;
}



export default class Role{
    ctx:any;
    lives: 100;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    preFm: number;
    velocity: [number, number]; // 每帧水平变量，右为正，左为负
    stV: number;
    horizon: number;
    tempHorizon: number; // 临时水平线、起跳点、平抛点、下落点
    button: button;
    map: Array<any>;
    screenWidth: number;
    screenHeight: number;
    mapPosition: [number, number]; // role在地图中的位置，向前x向需+width，向下y向需+height
    mapVelocity: number; // 用以控制当map移动时

    constructor() {
        this.velocity = [0, 0];// 起始基本速度
        this.button = {space: keyStatus.off, left: keyStatus.off, right: keyStatus.off};// 从静止开始
    }

    setStatus(width:number,height:number){
        this.width = width;
        this.height = height;
    };
    setPos(x:number,y:number){
        this.positionX = x;
        this.positionY = y;
    };


    // 初级匀速运动，高级变速运动，注意变速运动有下限和上限，并对jump的高度有影响，使得横向速度与垂直初始速度有影响
    run(){
        const newRole = this;
        const { map, width, height, velocity, positionY, findPresentMapPointRun, mapPosition, screenWidth, positionX, getMapX } = newRole;
        let newX = positionX;
        let newY = positionY;



        // 当前坐标与map之间的关系
        const mapMoveLimitRage = newRole.screenWidth/2; // 移动范围参数化，暂时不计入右侧范围
        const posX = getMapX(mapMoveLimitRage, map, mapPosition, positionX, screenWidth, velocity, width); // role在map地图(注意不是screenMap)的x坐标，因为有地图移动
        const pos = [posX, newY];
        const V = [...velocity];

        const point = findPresentMapPointRun(pos, newRole); // 当前role在map上的垂直映射点

        let increment = slowDown(newRole.preFm); // 跳跃瞬时增量
        // role当前在地图的Y坐标
        const level = point[1];
        // 当前role的Y以底部计算
        let positionBottomY = positionY;

        // 尾部渲染地图中点
        const lastMiddle = map[map.length - 1][0] - mapMoveLimitRage;

        //判断Y坐标是否约等于（ 当前x坐标与map上的映射点x坐标位置比对）。
        const balance = approximatelyEqual(level, positionBottomY, 0);
//--------------------------------------------------------------水平左右移动逻辑
        // 障碍物临界内容
        if(!balance){ //
            if(level > positionBottomY){ // 撞墙
                if(point[2] > 0){ // [number, number, number(0平台/1凸起/-1凹陷)]
                    V[0] = 0;
                }
                // newX = newX;
            } else if(level < positionBottomY){ // 平抛，run的跳跃需要关闭
                if(velocity[0]){ // 无法屏蔽移动超过平台边界时的跳跃，
                    newRole.preFm = 25; // 这条语句会开启跳跃动作
                    newRole.tempHorizon = level;
                    newRole.preFm = newRole.preFm + 1; // 这条语句会开启跳跃动作
                }
            }
        } else { // level === positionBottomY 时role水平方向运动
            if(newX <= 0 && newRole.velocity[0] < 0){ // 左侧撞墙
                newX = 0;
            } else if(newX + newRole.mapPosition[0] - newRole.screenWidth/2 >= newRole.map[newRole.map.length - 1][0] - width && velocity[0] >= 0){
                // 右侧撞墙
                newX = newRole.screenWidth - width;
            } else if ( pos[0] >= mapMoveLimitRage &&  (newX + newRole.mapPosition[0] - newRole.screenWidth/2 <= lastMiddle)){
                // role相对于map的当前坐标：如果小于半屏则为newX，大于则为newRole.mapPosition[0]
                newX = mapMoveLimitRage;
                newRole.velocity[0] = 0;
            }
        }
        newX = newX + V[0];

        // map临界内容
        // |---|-------------|---|
        // 左端---前端半屏界限----中间段----后端半屏---右端
        // 中间段时停止role动作，此时会开启map动作

//--------------------------------------------------------------

        // 绘制
        newRole.setPos(newX, newY);
        newRole.draw();
    };
    // run模式查找role在map下的投影，会根据role宽度和所在位置智能寻找支撑点
    findPresentMapPointRun(pos: number[], newRole: any){
        const { map, width, height, velocity, tempHorizon } = newRole;
        let point: [number, number, number] = [pos[0], 0, 0]; // [number, number, number(0平台/1凸起/-1凹陷)]
        let roleBottom = pos[1]; // 角色底部,由于map中是以horizon为基准计算的
        let jumpStartHorizon = tempHorizon; // 起跳点记录
        for(let i = 0; i < map.length - 2; i++){
            let pointA: [number, number] = map[i],
                pointB: [number, number] = map[i + 1];
            if(pos[0] + width === pointA[0]){ // role右侧点与map点重合:台阶左下角底边点/跳跃（平抛）时台子左上角点/台子右上角点（错误处理台子右下角点）
                if(pointA[1] > pointB[1]){
                    if(roleBottom === pointA[1]){ // 与顶边重合
                        return [pos[0], pointA[1], -1];
                    } else if(roleBottom === pointB[1] || (roleBottom < pointA[1] && roleBottom > pointB[1])){ // 错误进入了平台内部
                        return [pos[0] + width, pointB[1], 0]; // 修正占据建筑内部的错误
                    } else if(roleBottom > pointA[1]){
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointA[1], 0];
                    }
                } else if(pointA[1] < pointB[1]){
                    if(roleBottom === pointA[1]){ // 与底边重合
                        // 此处要有初始跳跃点比较
                        if(velocity[0] > 0){
                            return  [pos[0], pointB[1], 1]; // 台阶
                        } else if(velocity < 0){
                            return  [pos[0], pointA[1], 0]; //
                        } else {
                            return  [pos[0], pointB[1], -1];
                        }
                    } else if(roleBottom === pointB[1]){ // 与台阶左侧点重合
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointA[1], 0];
                    } else if(roleBottom > pointB[1]){
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointB[1], 0];
                    } else if(roleBottom > pointA[1] && roleBottom < pointB[1]){// 原地跳起 / 撞墙, 此时如果有v则会出错，需要另行判断
                        return [pos[0], pointB[1], 0];
                    }
                } else { // pointA[1] === pointB[1] 在凹陷的平台上
                    return [pos[0], pointA[1], 0];
                }
            } else if(pos[0] === pointA[0]){  // role左侧点与map点重合，map点呈现高度下降趋势，跳上右侧台/从高台右上角跳下  动作
                if(pointA[1] < pointB[1]){
                    if(roleBottom === pointB[1]){ // 与顶边重合
                        return [pos[0], pointB[1], 0];
                    } else if(roleBottom === pointA[1] || (roleBottom < pointB[1] && roleBottom > pointA[1])){ // 错误进入了平台内部
                        return [pos[0] + width, pointA[1], 0]; // 修正占据建筑内部的错误
                    } else if(roleBottom > pointB[1]){
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointB[1], 0];
                    }
                } else if(pointA[1] > pointB[1]){
                    if(roleBottom === pointB[1]){ // 与底边重合
                        if(velocity[0] < 0){
                            return [pos[0], pointA[1], 1];
                        } else if(velocity[0] > 0){
                            return [pos[0], pointB[1], 0];
                        } else {
                            return [pos[0], pointB[1], 0];
                        }
                    } else if(roleBottom === pointA[1]){ // 与台阶左侧点重合
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointA[1], 0];
                    } else if(roleBottom > pointA[1]){
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointA[1], 0];
                    } else if(roleBottom > pointB[1] && roleBottom < pointA[1]){// 原地跳起 / 撞墙, 此时如果有v则会出错，需要另行判断
                        return [pos[0], pointA[1], 0];
                    }
                } else { // pointA[1] === pointB[1] 在凹陷的平台上
                    return [pos[0], pointA[1], 0];
                }
                // return [pos[0], pointB[1]];
            }

            if(pos[0] > pointA[0] && pos[0] + width < pointB[0]){ // role整体在平台上
                return  [pos[0], pointA[1], 0];
            } else if(pos[0] < pointA[0] && pos[0] + width > pointA[0] && pointA[0] === pointB[0]){ // map上必有上与下两个x相同的点在中间
                return  pointA[1] > pointB[1] ? [pos[0], pointA[1], 0] : [pos[0], pointB[1], 0];
            }
        }
        return point
    }

    jump(){
        const newRole = this;
        const { findPresentMapPoint, width, height, velocity, positionY, getMapX, map, preFm, mapPosition, positionX, screenWidth, tempHorizon, horizon } = this;

        // 基础计算内容
        let newX = positionX; // 为速度v，需有正反向v和距离边界关系的处理
        let newY = positionY;

        const V = [...velocity];

        let increment = slowDown(newRole.preFm); // 跳跃瞬时增量

        // 当前坐标与map之间的关系
        const mapMoveLimitRage = newRole.screenWidth/2; // 移动范围参数化，暂时不计入右侧范围
        const posX = getMapX(mapMoveLimitRage, map, mapPosition, positionX, screenWidth, velocity, width); // role在map地图(注意不是screenMap)的x坐标，因为有地图移动
        const pos = [posX, positionY]; // 当前role在map的坐标点，
        const point = findPresentMapPoint(pos, newRole); // 当前role在map上的垂直映射点


        // role当前在地图的Y坐标，map映射点
        const mappingPointY = point[1];

        // role底部的Y坐标
        let rolePositionBottomY = positionY;

        //判断Y坐标是否约等于（ 当前x坐标与map上的映射点x坐标位置比对）。
        const balance = approximatelyEqual(mappingPointY, positionY, increment);

//---------------------Y向坐标处理
        // 当前x坐标与map的x坐标对比
        // 未作部分：如果大于mapMoveLimitRage(screenWidth/2)则v为0，此时转化为纵向jump，然后x向map继续移动，目前状态jump时map不动
        if(balance){ // 该结果在结束时可能不会出现，需要近似运算
            // 平路跳跃,需要区分开始和结束
            if(point[2] > 0){ // [number, number, number(0平台/1凸起/-1凹陷)]
                V[0] = 0;
            }

            if(newRole.preFm === 1){                          // 动画开始
                newRole.tempHorizon = newRole.positionY;  // 记录当前水平位置

                // 跳跃起点应该记录跳跃点和初始速度V，计算能够达到的最高地点和帧数
                newRole.preFm = newRole.preFm + 1;
                newRole.button.space = keyStatus.loading;
                newY = mappingPointY + increment; //

            } else {// 动画结束 if(newRole.button.space === keyStatus.loading)
                // 动画结束，重置当前Y向位置为映射位置
                // newY = level < positionBottomY + increment ? level: positionBottomY + increment - height;
                newRole.preFm = 0;// 重置跳跃动画帧
                newRole.mapVelocity = 0; // 清理map的v速度，不正确？

                newRole.button.space = keyStatus.off;// 关闭跳跃loading状态
                newRole.tempHorizon = mappingPointY; // 动画开始 动画结束，重新记录位置
            }
        } else if(rolePositionBottomY > mappingPointY){ // 跳起，未着地，未撞墙，由于墙由上下两个点绘制，level为role左侧，垂直映射到map上的点

            newRole.preFm = newRole.preFm + 1;

            if(rolePositionBottomY + 10 <= mappingPointY && preFm > 24){
                newY = mappingPointY;
                newRole.preFm = 0;
            }

        //    跳起平台转换，开始----------------
            if (tempHorizon > mappingPointY) { // 当起跳点大于映射点，（起跳点一定大于等于映射点）
                newY = tempHorizon + increment;
            } else if (tempHorizon < mappingPointY) { // 跳上高台
                newY = tempHorizon + increment;
            } else {// 起跳空中状态
                newY = mappingPointY + (increment < 0 ? 0 :increment); // 落点必定大于等于投影点
            }

        //    跳起平台转换，结束--------------------


        } else if(rolePositionBottomY < mappingPointY){// 撞墙，由于墙由上下两个点绘制，level为role左侧，垂直映射到map上的点
            V[0] = 0;
            newRole.preFm = newRole.preFm + 1;

            // 此处 跳上 / 跳下 高台合适
            if(tempHorizon > mappingPointY){ // 从高处跳下，起跳点大于映射点
                //撞墙部分，撞墙如何达到底部？？？
                newY = mappingPointY + increment;
            } else {
                // 垂直跳跃在边界处理
                if(point[2] > 0){ // 到达底部
                    newY = mappingPointY;
                    newRole.preFm = 0;
                } else if(point[2] < 0){ // 凹台，向下趋势
                    newY = tempHorizon + (increment >= 0 ? increment : 0);
                } else { // 平台
                    newY = tempHorizon + (increment >= 0 ? increment : 0);
                }
            }
        }

//---------------------

//--------------------- map动作渲染role操作
        // 地图移动限制范围
        // 正向
        // 反向为  newRole.screenWidth/2 - mapMoveLimitRage;
        const leftEdge = mapMoveLimitRage;
        // 尾部渲染地图中点，正向。
        const rightEdge = map[map.length - 1][0] - mapMoveLimitRage;

        // map凸台
        // if(!balance && level < positionBottomY){ // 障碍物，需要添加建筑物
        //     newRole.velocity[0] = 0;
        //     // 停止
        //     newX = point[0];
        //
        // } else {
        // }

        // |---|-------------|---|
        // 左端---前端半屏界限----中间段----后端半屏---右端
        // 中间段时停止role动作，此时会开启map动作
        // 注意因为根据x值判断，因此会截断所有变化
            // 左侧撞墙
        if(newX <= 0 && newRole.velocity[0] < 0){
            newX = 0;
        } else if(newX + newRole.mapPosition[0] - newRole.screenWidth/2 >= newRole.map[newRole.map.length - 1][0] - width){
            // 右侧撞墙
            newX = newRole.screenWidth - width;
        } else if ( pos[0] >= mapMoveLimitRage &&  (newX + newRole.mapPosition[0] - mapMoveLimitRage <= rightEdge)){     // map 移动区间
            // role相对于map的当前坐标
            newX = mapMoveLimitRage;
            newRole.velocity[0] = 0;
        } else {
            newX = positionX + V[0];
        }


//--------------------- map渲染结束


// 定位，绘制
        newRole.setPos(newX, newY);
        newRole.draw();
    };

    // 查找当前坐标在map上的投影点，这个点以左侧作为基准
    // 精彩判断部分：
    // 判断x与x+width在map上的映射，如果两个映射坐标Y值不同（如果有x等值的点），则中间必定有点，如果中间没有点则role在台阶上，如果中间有点则role的一部分在台阶上，取y值高的点。
    findPresentMapPoint(pos: number[], newRole: any){
        const { map, width, height, velocity } = newRole;
        let point: [number, number, number] = [pos[0], 0, 0];
        let roleBottom = pos[1]; // 角色底部,由于map中是以horizon为基准计算的
        for(let i = 0; i < map.length - 2; i++){
            let pointA: [number, number] = map[i],
                pointB: [number, number] = map[i + 1];

            if(pos[0] > pointA[0] && pos[0] + width < pointB[0]){ // role整体在平台上
                return  [pos[0], pointA[1], 1];
            } else if(pos[0] < pointA[0] && pos[0] + width > pointA[0] && pointA[0] === pointB[0]){ // map上必有上与下两个x相同的点在中间
                return  pointA[1] > pointB[1] ? [pos[0], pointA[1], 1] : [pos[0], pointB[1], 1];
            }

            if(pos[0] + width === pointA[0]){ // role右侧点与map点重合，map点呈现高度上升趋势
                if(pointA[1] > pointB[1]){
                    if(roleBottom === pointA[1]){ // 与顶边重合
                        return [pos[0], pointA[1], 0];
                    } else if(roleBottom === pointB[1] || (roleBottom < pointA[1] && roleBottom > pointB[1])){ // 错误进入了平台内部
                        return [pos[0] + width, pointB[1], 0]; // 修正占据建筑内部的错误
                    } else if(roleBottom > pointA[1]){
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointA[1], 0];
                    }
                } else if(pointA[1] < pointB[1]){
                    if(roleBottom === pointA[1]){ // 与底边重合
                        // 此处要有初始跳跃点比较
                        if(velocity[0] > 0){
                            return  [pos[0], pointA[1], 1];
                        } else if(velocity[0] < 0){
                            return  [pos[0], pointA[1], -1];
                        } else {
                            return  [pos[0], pointA[1], 0];
                        }
                    } else if(roleBottom === pointB[1]){ // 与台阶左侧点重合
                        // 此处要有初始跳跃点比较
                        if(velocity[0] > 0){
                            return [pos[0], pointB[1], 1];
                        } else if(velocity[0] < 0){
                            return [pos[0], pointA[1], 0];
                        } else {
                            return [pos[0], pointA[1], 0];
                        }
                    } else if(roleBottom > pointB[1]){
                        // 此处要有初始跳跃点比较
                        if(velocity[0] > 0){
                            return [pos[0], pointB[1], 1];
                        } else if(velocity[0] < 0){
                            return [pos[0], pointA[1], -1];
                        } else {
                            return [pos[0], pointA[1], 0];
                        }
                    } else if(roleBottom > pointA[1] && roleBottom < pointB[1]){// 原地跳起 / 撞墙, 此时如果有v则会出错，需要另行判断
                        if(velocity[0] > 0){
                            return [pos[0], pointB[1], 0];
                        } else if(velocity[0] < 0){
                            return [pos[0], pointA[1], 0];
                        } else {
                            return [pos[0], pointA[1], 0];
                        }
                    }
                } else { // pointA[1] === pointB[1] 在凹陷的平台上
                    return [pos[0], pointA[1], 0];
                }
            } else if(pos[0] === pointA[0]){  // role左侧点与map点重合，map点呈现高度下降趋势，跳上右侧台/从高台右上角跳下  动作
                if(pointA[1] < pointB[1]){
                    if(roleBottom === pointB[1]){ // 与顶边重合
                        return [pos[0], pointB[1]];
                    } else if(roleBottom === pointA[1] || (roleBottom < pointB[1] && roleBottom > pointA[1])){ // 错误进入了平台内部
                        return [pos[0] + width, pointA[1]]; // 修正占据建筑内部的错误
                    } else if(roleBottom > pointB[1]){
                        // 此处要有初始跳跃点比较
                        return [pos[0], pointB[1]];
                    }
                } else if(pointA[1] > pointB[1]){
                    if(roleBottom === pointB[1]){ // 与底边重合
                        if(velocity[0] > 0){
                            return [pos[0], pointB[1], 0];
                        } else if(velocity[0] < 0){
                            return [pos[0], pointA[1], 1];
                        } else {
                            return [pos[0], pointB[1], 0];
                        }
                    } else if(roleBottom === pointA[1]){ // 与台阶左侧点重合
                        // 此处要有初始跳跃点比较
                        if(velocity[0] > 0){ // 抛下
                            return [pos[0], pointB[1], -1];
                        } else if(velocity[0] < 0){ // 跳上
                            return [pos[0], pointA[1], 1];
                        } else {
                            return [pos[0], pointB[1], 0];
                        }
                        // return [pos[0], pointA[1]];
                    } else if(roleBottom > pointA[1]){ // 跳上
                        // 此处要有初始跳跃点比较
                        if(velocity[0] > 0){ // 抛下
                            return [pos[0], pointB[1], -1];
                        } else if(velocity[0] < 0){ // 跳上
                            return [pos[0], pointA[1], 1];
                        } else {
                            return [pos[0], pointB[1], 0];
                        }
                    } else if(roleBottom > pointB[1] && roleBottom < pointA[1]){// 原地跳起 / 撞墙, 此时如果有v则会出错，需要另行判断
                        if(velocity[0] > 0){ // 抛下
                            return [pos[0], pointB[1], -1];
                        } else if(velocity[0] < 0){ // 跳上
                            return [pos[0], pointA[1], 1];
                        } else {
                            return [pos[0], pointB[1], 0];
                        }
                    }
                } else { // pointA[1] === pointB[1] 在凹陷的平台上
                    return [pos[0], pointA[1], 0];
                }
            }


        }
        return point
    };

    // 获取当前role在整体map上的实际点的x坐标，
    // 参数：mapMoveLimitRage左右侧role的实际运行范围，
    // mapPosition是map移动中心点（实际移动中心在map的尺寸），如果mapMoveLimitRage参数化，screenWidth/2(半屏) - mapMoveLimitRage 作为常数存在;
    // positionX为role在screen场景的位置
    // 当mapMoveLimitRage设定小于半屏时，换为：
    // 如果在前半部分 velocity[0] > 0 时， (mapPosition[0] - (screenWidth/2 - mapMoveLimitRage) > mapMoveLimitRage) ? (mapPosition[0] - (screenWidth/2 - mapMoveLimitRage) : positionX
    // 后半部分：顺程 screenWidth/2 + mapMoveLimitRage(尾部role路程)
    getMapX(mapMoveLimitRage: number, map: Array<Array<number>>, mapPosition: [number, number], positionX:number, screenWidth: number, velocity:[number, number], width: number){
        if(velocity[0] > 0){ // 因为velocity[0]的方向与map方向协同，这里需要另行考虑。
            if(positionX < mapMoveLimitRage){
                return positionX;
            } else if(positionX > (map[map.length - 1][0]) - screenWidth + mapMoveLimitRage){
                return map[map.length - 1][0] - screenWidth + positionX
            } else {
                return  mapPosition[0] - screenWidth/2 + mapMoveLimitRage
            }
        } else if(velocity[0] < 0){
            if(positionX > map[map.length - 1][0] - mapMoveLimitRage){
                return  map[map.length - 1][0] - screenWidth + positionX;
            } else if(positionX < screenWidth - mapMoveLimitRage){
                return positionX;
            } else {
                return  mapPosition[0] + screenWidth/2 - mapMoveLimitRage
            }
        } else {
            // 水平未移动
            return mapPosition[0] - screenWidth/2 + positionX;
        }
    }

    frame(){ // 暂时没用
        const newRole = this;
        const ctx = this.ctx;
        setTimeout(()=>{
            newRole.clearRect(ctx);
        },1000/60)
    };
    draw(){
        const {positionX, positionY, width, height, ctx, horizon} = this;
        ctx.fillStyle = "rgb(229,99,9)";
        // 需要根据horizon基本坐标系偏移处理当前的positionX, positionY
        ctx.fillRect(positionX, horizon - positionY - height, width, height);
    };
    clearRect(ctx:any){
        const { positionX, positionY, width, height, horizon} = this;
        // 需要根据horizon基本坐标系偏移处理当前的positionX, positionY
        ctx.clearRect(positionX, horizon - positionY - height, width, height);
    };

    create(ctx: any,initialData:initialData){
        // 初始数据及状态
        const {x, y, horizon, map, roleWidth, roleHeight, v, tempHorizon} = initialData;
        this.ctx = ctx;
        this.setStatus(roleWidth, roleHeight); // 初始大小
        this.setPos(x, y); // 起始点

        this.preFm = 0;// 起始帧
        this.stV = v;// 标准速度

        this.tempHorizon = tempHorizon;// 从静止开始
        this.horizon = horizon;// 从静止开始
        this.map = map;// 从静止开始

         // 基础绘制,可省略，因为整体刷新
         // this.draw();

        // 动作
        // this.frame();
    }
}
