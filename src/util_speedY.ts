 // 10 为默认垂直速度，因为x方向变速运动未考虑，因此暂定为10
 // 48桢去掉，添加参数status，这样会将动作区分开来。
 // 角色run时候要判断前方是否还有“当前建筑、地图”实体存在，没有则掉落。
 // 跳跃也要有“实体”，如果当前x轴不存在实体则向下一层x轴搜索
 // 应当判断slowDown(newRole.preFm)内容是否等于0
export function slowDown(t:number){
    if(t <= 24){                        // 匀减速
        return  Math.round(10*t-5*t*t/24)
    } else if (t <= 48){
        const t1 = 48 - t + 1;              // 匀加速
        return  Math.round(10*t1-5*t1*t1/24) // Math.floor(5*t1*t1/24)
    } else if (t > 48){                 // 超过48帧后变为匀速
        const t2 = t - 48;
        return  -Math.round(10*t2)  // 10*t2+5*t2*t2/24
    }
}

export function frameCounter(t:number){
    if(t < 25 && t > 0){
        return  25 - t + 24;
    } else {
        return t;
    }
}
