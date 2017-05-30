const STATE_NOT_CONNECTED = 0;
const STATE_CONNECTING = 1;
const STATE_CONNECTED = 2;

class JoyCarClient {
  constructor(props) {
    this.socket = null
    this.document = props.document
    this.joystick = new VirtualJoystick({
        container : this.document.getElementById('container'),
        mouseSupport  : true,
        limitStickTravel: true,
        stickRadius: 140
    });
    this.btnOP = document.getElementById('op')
    this.btnOP.onclick = () => {
      this.connect()
    }
    this.lblState = document.getElementById('state')
    this.inputUrl = document.getElementById('url')
    this.divPanel = document.getElementById('panel')
    this.btnLock = document.getElementById('lock')
    this.lblDir = document.getElementById('direction')
    this.lastDirection = '';
    this.state = {
      state: STATE_NOT_CONNECTED,
      direction: {left: 0, right: 0}
    };
    this.frame()
  }

  connect() {
    const url = this.inputUrl.value;
    const {state} = this.state
    if (state != STATE_NOT_CONNECTED) {
      return;
    }
    this.socket = new WebSocket(url)
    this.state.state = STATE_CONNECTING
    this.socket.onopen = () => {
      this.onConnected()
    }
    this.socket.onmessage = (event) => {
      this.onMessage(JSON.parse(event.data))
    }
    this.socket.onclose = (event) => {
      this.disconnect(true)
    }
  }

  onConnected() {
    this.state.state = STATE_CONNECTED
    this.divPanel.style.display = 'block'
    this.socket.send(JSON.stringify({type: 'hello'}))
    this.inputUrl.disabled = true
    this.btnOP.innerText = '断开';
    this.btnOP.onclick = () => {
      this.disconnect(false)
    }
  }

  disconnect(bySocket) {
    const {state} = this.state
    if (state == STATE_NOT_CONNECTED) {
      return;
    }
    this.divPanel.style.display = 'none'
    this.state.state = STATE_NOT_CONNECTED
    this.inputUrl.disabled = undefined
    this.btnOP.innerText = '连接';
    this.btnOP.onclick = () => {
      this.connect()
    }
    this.lastDirection = ''
    if (!bySocket) {
      this.socket.close()
    }
    this.socket = null
  }

  onMessage(msg) {
    if (msg.looping) {
      this.btnLock.innerText = '锁定'
      this.btnLock.onclick = ()=>{
        this.send({type: 'lock'})
      }
    } else {
      this.btnLock.innerText = '解锁'
      this.btnLock.onclick = () => {
        this.send({type: 'unlock'})
      }
    }

    this.lblDir.innerText = JSON.stringify(msg)

    console.log(msg)

  }

  getState() {
    return {...this.state}
  }

  send(msg) {
    if (this.state.state == STATE_CONNECTED) {
      this.socket.send(JSON.stringify(msg))
    }
  }

  frame() {
    const direction = this.getDirection();
    const dir = direction.left + ',' + direction.right
    if (dir != this.lastDirection) {
      this.updateDir(direction)
      this.lastDirection = dir
    }
    requestAnimationFrame(this.frame.bind(this))
  }

  updateDir(direction) {
    console.log(direction)
    this.send({type: 'speed', payload: direction})
  }

  getDirection() {
    const joystick = this.joystick
    const limit = 5000;
    let x = 0;
    let y = 0;
    const deltaX = joystick.deltaX();
    const deltaY = joystick.deltaY();
    if ((deltaX * deltaX + deltaY * deltaY) > limit) {
        if (joystick.up()) {
            x = 1;
        } else if (joystick.down()) {
            x = -1;
        }
        
        if (joystick.left()) {
            y = -1;
        } else if (joystick.right()) {
            y = 1;
        }
    }

    let l = 0; // 0 停止 1 半速 2 全速
    let r = 0;
    if (y == 0) {
        // 直线行驶
        l = 2 * x;
        r = 2 * x;
    } else if (y == 1) {
        // 右转
        if (x == 0) {
            // 原地右转
            l = 2;
            r = -2;
        } else if (x == 1) {
            l = 2;
            r = 1; // 右轮半速
        } else {
            l = -2;
            r = -1;
        }
    } else {
        // 左转
        if (x == 0) {
            l = -2;
            r = 2;
        } else if (x == 1) {
            l = 1;
            r = 2;
        } else {
            l = -1;
            r = -2;
        }
    }

    return {left: l, right: r}
  }
}

let client = new JoyCarClient({
  document: document
})

