import Role from './Role';
import { bindEvent } from './util_event'
import { jumpLine } from './util_math'
import draPath from "./draPath";
import { keyStatus } from './enumStatus';
import { build, Building } from "./building";



class app{
    protected static gameName = 'superMario';
    protected static version = '1.0';

    newRole: any;
    ctx:any;
    width:number;
    height:number;
    buildings: Array<build>;
    velocity: [number, number]; // 每帧水平变量，右为正，左为负
    // 建筑应当有 可破坏/不可破坏 属性。当role头部碰到可破坏时，当role脚步碰到怪物时。

    map: Array<Array<number>>;   // [[x, -1]]，x=-1时为极右端，y=-1代表最底端。
    screenMap: Array<Array<number>>;   // [[x, -1]]，x=-1时为极右端，y=-1代表最底端。
    mapPosition: [number, number];
    mapVelocity: number;


    horizon: number; // 水平基准线，Y坐标值 = horizon - 高度y
    objId: number; //  window.cancelAnimationFrame使用的id


    constructor() {
        this.getContextInfo("tablet");
    }

    getContextInfo(id:string){
        // 注意前面需要有 <HTMLCanvasElement>
        // 或者 let canvas = document.getElementById('tablet') as HTMLCanvasElement;
        let canvas = <HTMLCanvasElement> document.getElementById(id);
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        this.horizon = 400;
        this.mapPosition = [this.width/2, 0];
        this.ctx = canvas.getContext('2d');
    }
    clearCanvas(){ // 其他规则图形更新将不占据主要刷新部分
        const {ctx, width, height} = this;
        ctx.clearRect(0, 0, width, height);
    }
    frame(){//整体刷新
        const app = this; // 属性

        // 角色
        const newRole = app.newRole;
        const { stV } = newRole;
        const { space, right, left } = newRole.button;


        // 清除
        app.clearCanvas();

        // 设置当前地图为当前屏幕
        app.getMapRange();


        // 键盘控制状态判断，冻结等待动作完成
        // 跳跃时扩展状态，转换成不可操作状态
        if(space === keyStatus.on){
            newRole.button.space = keyStatus.loading;
            newRole.preFm = 1;
            if(newRole.button.left === keyStatus.on) {
                newRole.button.left = keyStatus.loading;
            } else if(newRole.button.right === keyStatus.on)newRole.button.right = keyStatus.loading;
        }



//---------------------------------- 控制map渲染模块
        app.moveMap(newRole, app);
// 绘制map
        draPath(app.ctx, this.screenMap, null, app.horizon, app.height);
//---------------------------------


        // 控制状态判断
        if(newRole.button.space === keyStatus.loading || newRole.preFm){ // 有正在进行的跳跃帧
            newRole.jump();
        } else {

            if(!space && !right && !left){        // 静止
                newRole.velocity[0] = 0;
                newRole.run();
            } else if(space && !right && !left){  // 垂直
                newRole.preFm = 1;
                newRole.button.space = keyStatus.loading;
                newRole.velocity[0] = 0;
                newRole.jump();
            } else if(!space && (right || left)){ // 水平
                newRole.velocity[0] = right ? stV : -stV;
                newRole.run();
            } else if(space && (right || left)){  // 跳跃
                newRole.preFm = 1;
                newRole.button.space = keyStatus.loading;
                if(newRole.button.left === keyStatus.loading || newRole.button.right === keyStatus.loading){ // 碰壁
                    newRole.velocity[0] = 0;
                } else {
                    newRole.velocity[0] = right ? stV : -stV;
                }

                newRole.jump();
            }
        }

        // 递归
        window.requestAnimationFrame(app.frame.bind(this));
    };
    // 移动map函数独立出来
    moveMap(newRole:any, app:any){
        const { space, right, left } = newRole.button;
        // 当前运行速度,注意跳跃进度会影响
        const lastMiddle = app.map[app.map.length - 1][0] - app.width/2;

        // 按键规则对map速度的影响
        app.mapVelocity = right ? newRole.stV :(left ? -newRole.stV : 0);

        // if(newRole.mapVelocity === 0){
        //     app.mapVelocity = 0;
        // }

        newRole.mapVelocity = app.mapVelocity; // 传递参数到role
        // x 方移动Y轴，map渲染位置改变,
        // 已有正向，反向？？？   |---|-------------|---|
        // 左端---前端半屏界限----中间段----后端半屏---右端
        if(newRole.positionX < app.width/2){ // 前端区间
            app.mapVelocity = 0;
            if(app.mapPosition[0] > app.width/2){ //在后半段递减
                app.mapPosition[0] = app.mapPosition[0] + app.mapVelocity;
            } else{
                app.mapPosition[0] = app.width/2;
            }
        } else if(newRole.positionX === app.width/2){ // 注意,如果不等无法启动地图移动动画,隐含条件是只有role中的newX在中间段停止后,此处动画才会启动

            // console.log(newRole.preFm, 'qwe');
            if(newRole.preFm){ // 跳跃运行中，此处以后可能会有问题，重复space键时无法停止进程，垂直跳跃没有清理最后的速度
                app.mapVelocity = right ? newRole.stV :(left ? -newRole.stV : 0);
            }

            app.mapPosition[0] = app.mapPosition[0] + app.mapVelocity;
        } else if(app.mapPosition[0] > app.width/2 && app.mapPosition[0] < lastMiddle){ // 中间段
            app.mapPosition[0] = app.mapPosition[0] + app.mapVelocity;  // map最大尺寸
        } else if(app.mapPosition[0] === lastMiddle){ // 此处突然加速???原因:map和role叠加速度，叠加速度是因为区间判断不准确
            app.mapPosition[0] = lastMiddle;
            newRole.velocity[0] = app.mapVelocity;
        } else if(newRole.positionX > lastMiddle){  // 尾部区间
            app.mapVelocity = 0;
            app.mapPosition[0] = lastMiddle + app.mapVelocity;
        }
        newRole.mapPosition[0] = app.mapPosition[0]; // 存储变革数据到role中
    };

    // map在屏幕的渲染范围
    getMapRange(){
        const { map, mapPosition, width, height } = this;
        // mapPosition为地图渲染中心点

        let range = map.filter((item)=>{
           return (item[0] >= (mapPosition[0] - width/2)) && (item[0] <= mapPosition[0] + width/2);
        });
        // 要考虑没有点
        if(!range.length ){
            range.unshift([mapPosition[0] - width/2, 0]);
            range.unshift([mapPosition[0] - width/2, height]);
            range.push([mapPosition[0] + width/2, 0]);
            range.push([mapPosition[0] + width/2, height]);
        } else if(range.length === 1){ // 一个点的状态
            range.unshift([mapPosition[0] - width/2, range[0][1]]);
            range.unshift([mapPosition[0] - width/2, height]);
            range.push([mapPosition[0] - width/2, range[0][1]]);
            range.push([mapPosition[0] - width/2, height]);
        } else{ // 多点
            if(range[0][0] > mapPosition[0] - width/2){ // 如果开头点与当前screenMap不重叠
                range.unshift([mapPosition[0] - width/2, range[0][1]]);
                range.unshift([mapPosition[0] - width/2, height]);
            }
            if(range[range.length - 1][0] < mapPosition[0] + width/2){ // 如果末尾点与当前screenMap不重叠
                range.push([mapPosition[0] + width/2, range[range.length - 1][1]]);
                range.push([mapPosition[0] + width/2, height]);
            }
        }

        // 此处重新创建map数据
        let screenMapPre:any = [];
        range.forEach((item)=>{
            const itemPre = [...item]
            itemPre[0] = itemPre[0] - mapPosition[0] + width/2;
            screenMapPre.push(itemPre);
        });

        this.screenMap = screenMapPre;
    };


    run = ()=>{
        const app = this;
        const { map, horizon, ctx } = app;


        //绘制场景



        // 添加建筑
        app.buildings = [];
        app.buildings.push(new Building());


        //绘制怪物


        // 绘制角色
        const newRole = new Role();
        newRole.create(ctx,{
            x: 0,
            y: 0,
            horizon: horizon,
            map: map,
            v: 5,
            roleWidth: 40,
            roleHeight: 50
        }); // 起始点
        app.newRole = newRole;
        newRole.screenWidth = app.width;
        newRole.screenHeight = app.height;
        newRole.mapPosition = [...app.mapPosition];


        // 关联事件，将当前对象，ctx和建筑、角色传入到控制部分
        bindEvent({
            ctx,
            app,
            role: newRole,
        });


        // 启动动画
        this.objId = window.requestAnimationFrame(this.frame.bind(this));
    };

    stop(){
        this.objId && window.cancelAnimationFrame(this.objId);
    }
}



// 要建立类似版面的整体替换逻辑（包含场景、模块、控制、取消控制），类似heros-war的版面切换，index/frame/setTimeout/function内容很庞大，要分块运行、分组运行等。


const newGame =  new app();
// newGame.map = [[0, 0],[300, 0], [350, 0],[350, 0],[400, 0],[400, 0],[1200, 0],[1200, 0],[1250, 0],[1250, 0], [1600, 0],[1750, 0], [1750, 0],[1800, 0], [1800, 0]];
 newGame.map = [[0, 0],[300, 0],
     [500, 0],[500, 60],[700, 60],[700, 0],
     [1200, 0],[1200, 120],[1250, 120],[1250, 0],
     [1750, 0], [1750, 50],[1800, 50], [1800, 0],
     [2500, 0], [2500, 100], [2550, 100], [2550, 0],
     [3000, 0], [3000, 50], [3050, 50], [3050, 0] ,
     [4000, 0], [4000, 60], [4050, 60], [4050, 0],
     [5000, 0], [5000, 150], [5050, 150], [5050, 0] // ,
     // [10000, 0], [10000, 150], [10050, 150], [10050, 0],
    // [49900, 0], [49900, 50], [50000, 50], [50000, 0]
 ];
newGame.run();
