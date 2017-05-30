var b = context.global.get('octalbonescript');

initPins(flow, context.global);
// 循环
function loop(node, flow, msg) {
    var interval = 200;
    var loopTimer = flow.get('loopTimer') || false;
    if (!loopTimer) {
        loopTimer = setInterval(function () {
            doInLoop(node, flow)
        }, interval);
    } else {
        clearInterval(loopTimer);
        loopTimer = 0
    }
    flow.set('loopTimer', loopTimer);
    return msg;
}

function getStep() {
    var step = context.get('step') || 0;
    step += 1;
    step %= 100;
    context.set('step', step);
    return step;
}
function inStep() {
    return (getStep() % 4) == 0;
}
function doInLoop(node, flow) {
    var dir = flow.get('direction') || {};
    var left = dir.left || 0;
    var right = dir.right || 0;
    // 计算输出
    var isInStep = inStep();
    // 
    var pins = getPins();
    if (Math.abs(left) != 1 || isInStep) {
        // 输出
        outputPins(left, pins.left);
    } else {
        outputPins(0, pins.left);
    }
    if (Math.abs(right) != 1 || isInStep) {
        // 输出
        outputPins(right, pins.right);
    } else {
        outputPins(0, pins.right);
    }
}

function outputPins(speed, pins) {
    node.log(JSON.stringify({speed: speed, pins: pins}))
    b.digitalWrite(pins[0], speed > 0 ? b.HIGH : b.LOW);
    b.digitalWrite(pins[1], speed < 0 ? b.HIGH : b.LOW);
}

function getPins() {
    var pins = {
        left: ['P8_08', 'P8_07'],
        right: ['P8_10', 'P8_09']
    }
    pins.all = [].concat(pins.left, pins.right)
    return pins;
}

function initPins(flow, global) {
    var initialized = flow.get('pinInitialized') || false;
    if (initialized) {
        //return;
    }
    flow.set('pinInitialized', true);
    var pins = getPins().all;
    for (var i in pins) {
        b.pinModeSync(pins[i], b.OUTPUT)
    }
}

