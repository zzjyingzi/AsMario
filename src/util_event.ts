import { keyStatus } from './enumStatus';
interface eventTarget{
    ctx: any;
    app: any;
    role: any;
}


export function bindEvent(target:eventTarget){
    window.addEventListener("click", (e)=>{

    });
    window.addEventListener("keydown", (e)=>{
        // 按键的keyDown是以脉冲形式响应的大约30-32ms
        // 仅有keyStatus.off 时会开启，同时使用loading，keyStatus.loading时会跳过
        // 这样做是某个过程不需要被keyDown脉冲干扰，
        // 而keyUp会使得on/off缓存了一个状态而在loading结束后有执行下一步的指令。
        // 同时keydown重复按下会无效
        if(e.code === "Space"){
            // console.log(target.role.button.space,  keyStatus.loading);
            if(target.role.button.space === keyStatus.loading)return;
            target.role.button.space = keyStatus.on;
        }else if(e.code === 'ArrowRight'|| e.code === 'KeyE'){
            if(target.role.button.right === keyStatus.loading)return;
            target.role.button.right = keyStatus.on;
        } else if(e.code === 'ArrowLeft' || e.code === 'KeyQ'){
            if(target.role.button.left === keyStatus.loading)return;
            target.role.button.left = keyStatus.on;
        } else{
                // 其余暂不作处理
        }
    });
    window.addEventListener("keyup", (e)=>{
        // 会记录关闭状态，不会影响到keyStatus.loading，keyStatus.loading仅使用程序关闭
        // frame时会同时判断loading、on、off
        if(e.code === "Space"){
            if(target.role.button.space === keyStatus.loading)return;
            target.role.button.space = keyStatus.off;
        }else if(e.code === 'ArrowRight'|| e.code === 'KeyE'){
            target.role.button.right = keyStatus.off;
        } else if(e.code === 'ArrowLeft' || e.code === 'KeyQ'){
            target.role.button.left = keyStatus.off;
        } else{
            // 其余暂不作处理
        }
    });





    // 用对象设置三个属性来描述更为形象：比如
    /*  0/1  表示按键的按下与弹起状态
    {
        Space: 0,
        arrowRight: 0,
        ArrowLeft: 0
    }
    * */



    // setTimeout 末尾的递归判断条件：如果以60Hz一直运作就不会有递归判断条件，这样各个动作不会有判断条件的区分而写成不同的frame
    // 但会有比较大量的判断来觉得显示状态，并且判断有先后



    // 其他动作：转向、投掷会有更多的判断
}
