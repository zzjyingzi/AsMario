(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
 // window.requestAnimationFrame(_trans);
(function (){
    const con = document.getElementById("container");
    const tab = document.getElementById("tablet");
    tab.setAttribute("width", con.clientWidth .toString());
    tab.setAttribute("height", con.clientHeight.toString());

    window.onresize = function (){
        // 需要添加其他判断
        tab.setAttribute("width", con.clientWidth.toString());
        tab.setAttribute("height", con.clientHeight.toString());
        //target.app.stop();
        //target.app.run('tablet');
    };
})(window)
