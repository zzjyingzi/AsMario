
// Y向减速运动，Y=vt- at^2/2，v为初始速度，a为减速运动的值
//
export function jumpLine(x:number, p:number,){
    return Math.abs(-x^2/(2*p))

}


// 近似相等: 运动目标，精致目标，增量
export function approximatelyEqual(moveObj: number, staticObj: number, increment: number){
    const ab = Math.abs(moveObj - staticObj);
     return moveObj === staticObj || !Math.floor(ab);//小于1像素时按相等处理
}

// 经过重叠点时比较临近点，n-1、n、n+1,返回有效的投影点，需要根据速度返回特定的值
export function compareNearPoint(pos: number[], n: number, map:Array<Array<number>>, velocity: Array<number>, width: number):[number, number]{
    if(n !== 0){
        if(pos[0] + width === map[n][0]&& map[n+1][1] > map[n][1]){ // 右侧点与边界
            // 添加 pos[1] >= map[n][1] && pos[1] < map[n+1][1] 会导致x向多出velocity，并导致role跳跃，为什么？？？

            if(pos[1] >= map[n][1] && pos[1] < map[n+1][1]){
                console.log( pos[1], map[n][1], map[n+1][1], 777);
                return velocity[0] > 0 ? [pos[0], map[n+1][1]] : [pos[0], map[n][1]];
            }
        } else if(pos[0] === map[n][0] && map[n+1][1] < map[n][1]){ // 左侧点与边界
            return velocity[0] > 0 ? [pos[0], map[n][1]] : [pos[0], map[n+1][1]];
        }
    }
    return [pos[0], map[n][1]];
}
