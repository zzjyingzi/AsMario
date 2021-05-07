import {keyStatus} from "./enumStatus";

// map数据，位置
export type position = [number, number];
export type mapData =  Array<position>;


// 组合键开关
export interface button{
    space: keyStatus;
    left: keyStatus;
    right: keyStatus;
}

// 角色
export interface roleInterface {
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    velocity: [number, number];
}

// 角色初始化数据
export interface roleInitialData extends roleInterface{
    map: mapData;
    horizon:number;
    tempHorizon: number;
}
