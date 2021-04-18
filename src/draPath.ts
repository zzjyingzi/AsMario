// config 包含绘制样式和图像
// 需要根据screen渲染范围切割
export default function draPath (ctx:any, path:Array<Array<number>>, config: any, horizon: number, bottom: number, counter?:number){
    const n = counter === undefined ? 0: counter;
    if(n === 0){
        ctx.beginPath();
        ctx.fillStyle = 'rgb(62,44,29)';
        ctx.moveTo(path[0][0], bottom);
        ctx.lineTo(path[0][0], horizon - path[0][1]);
        draPath(ctx, path, config, horizon, bottom, n + 1)
    } else if(n <= path.length - 1){
        const x = path[n][0] === -1 ? 1900 : path[n][0];
        const y = path[n][1] === -1 ? bottom : path[n][1];

        if(n === path.length - 1){
            ctx.lineTo(x, bottom);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.lineTo(x, horizon - y);
            draPath(ctx, path, config, horizon, bottom,n + 1)
        }
    }
}
