
// 循环
function loop(node, flow, msg) {
    var interval = 200;
    var loopTimer = flow.get('loopTimer') || false;
    if (!loopTimer) {
        loopTimer = setInterval(function () {
            node.log('------')
        }, interval);
    } else {
        clearInterval(loopTimer);
        loopTimer = 0
    }
    flow.set('loopTimer', loopTimer);
    return msg;
}

// 获取引脚
function pins() {
    return {
        left: ['P8_07', 'P8_08'],
        right: ['P8_09', 'P8_10']
    };
}

// 初始化
function initial(flow, global) {
    var initialized = flow.get('pinInitialized') || false;
    if (initialized) {
        return;
    }
    flow.set('pinInitialized', true);

    var b = global.get('octalbonescript');
    var ps = pins();
    b.pinModeSync(ps.left[0], b.OUTPUT);
    b.pinModeSync(ps.left[1], b.OUTPUT);
    b.pinModeSync(ps.right[0], b.OUTPUT);
    b.pinModeSync(ps.right[1], b.OUTPUT);
}

// 方向解算 输出左右轮速度比
function direction(x, y, dir) {

}