// 计算攻击范围，运动范围
// 计算点是否在图形范围内，矩形，三角形，多边形，圆形，扇形，非规则图形
// 计算点在线上
type point = [number, number];

interface rect{
    ltPoint: point;
    width:number;
    height:number;
}

interface circle{
    point: point;
    r: number;
}

type triangle = [point, point, point];

// 点在矩形内，有一个点在矩形证明两个矩形相交, 需要四个点证明
export function isInRect(point: point, rect: rect){
    const { ltPoint, width, height } = rect;
    return !(point[0] < ltPoint[0] || point[0] > ltPoint[0] + width || point[1] < ltPoint[1] || point[1] > ltPoint[1] + height)
}

// 点在圆内
export function isInCircle(point: point, circle: circle){
    return Math.sqrt((point[0]-circle.point[0])^2 + (point[1]-circle.point[1])^2) <= circle.r;
}

// 任意三角形内
export function isInTriangle(point: point, triangle: triangle){

}
