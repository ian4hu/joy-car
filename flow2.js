/*
* @Author: Ian Hu
* @Date:   2017-05-30 14:52:58
* @Last Modified by:   Ian Hu
* @Last Modified time: 2017-05-30 16:56:40
*/

'use strict';

class JoyCarServer {
  constructor(props) {
    //super(props)
    this.pins = props.pins || {
      left: ['P8_07', 'P8_08'],
      right: ['P8_09', 'P8_10']
    }
    this.context = props.context
    this.flow = props.flow
    this.global = this.context.global
    this.node = props.node;
    this.state = {
      looping: false,
      direction: {left: 0, right: 0}
    }
    this.timer = false
  }

  unlock() {
    if (this.state.looping) {
      return;
    }
    const ret = this.initPins();
    if (ret) {
      this.state.looping = true;
      this.timer = setInterval(this.loop.bind(this), 1000 / 20)
    }
  }

  lock() {
    if (!this.state.looping) {
      return;
    }
    clearInterval(this.timer)
    this.state.looping = false;
    this.initPins();
  }

  initPins() {
    const b = this.global.get('octalbonescript')
    for(let pin of [...this.pins.left, ...this.pins.right]) {
      let ret = b.pinModeSync(pin, b.OUTPUT)
      if (ret) {
        continue
      }
      return ret
    }
    return true
  }

  loop() {
    const {left = 0, right = 0} = this.state.direction
    const {left: leftPins, right: rightPins} = this.pins

    if (Math.abs(left) != 1) {
      this.outputPins(left, leftPins)
    } else {
      this.outputPins(0, leftPins)
    }

    if (Math.abs(right) != 1) {
      this.outputPins(right, rightPins)
    } else {
      this.outputPins(0, rightPins)
    }
  }

  outputPins(speed, pins) {
    const b = this.global.get('octalbonescript')
    b.digitalWrite(pins[0], speed > 0 ? b.HIGH : b.LOW);
    b.digitalWrite(pins[1], speed < 0 ? b.HIGH : b.LOW);
  }

  setSpeed(direction) {
    if (this.state.looping) {
      this.state.direction = {...this.state.direction, ...direction}
    }
  }

  onMessage(msg) {
    let content = JSON.parse(msg.payload || '{}')
    if (typeof content != 'object') {
      content = {}
    }
    const {type = 'unknown', payload = {}} = content;
    switch(type) {
      case 'unlock': 
        this.unlock()
        break;
      case 'speed':
        this.setSpeed(payload)
       break;
      case 'lock':
        this.lock()
        break;
    }

    this.node.status(this.getStatus());
    return {payload: {...this.state}};
  }

  getStatus() {
    let status = {fill: 'red', shape: 'ring', text: 'locked'}
    status.text = 'locked'
    const {left = 0, right = 0} = this.state.direction
    if (this.state.looping) {
      status = {
        fill: 'green', 
        shape: 'dot', 
        text: left + ',' + right
      }
    }
    return status
  }
}

function onMessage(msg, context, flow, node) {
  let instance = context.get('instance') || null;
  if (instance == null) {
    instance = new JoyCarServer({
      pins: {
        left: ['P8_07', 'P8_08'],
        right: ['P8_09', 'P8_10']
      },
      context: context,
      flow: flow,
      node: node
    })
    context.set('instance', instance)
  }
  return instance.onMessage(msg)
}

onMessage(msg, context, flow, node)