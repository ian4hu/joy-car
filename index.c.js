'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STATE_NOT_CONNECTED = 0;
var STATE_CONNECTING = 1;
var STATE_CONNECTED = 2;

var JoyCarClient = function () {
  function JoyCarClient(props) {
    var _this = this;

    _classCallCheck(this, JoyCarClient);

    this.socket = null;
    this.document = props.document;
    this.joystick = new VirtualJoystick({
      container: this.document.getElementById('container'),
      mouseSupport: true,
      limitStickTravel: true,
      stickRadius: 140
    });
    this.btnOP = document.getElementById('op');
    this.btnOP.onclick = function () {
      _this.connect();
    };
    this.lblState = document.getElementById('state');
    this.inputUrl = document.getElementById('url');
    this.divPanel = document.getElementById('panel');
    this.btnLock = document.getElementById('lock');
    this.lblDir = document.getElementById('direction');
    this.lastDirection = '';
    this.state = {
      state: STATE_NOT_CONNECTED,
      direction: { left: 0, right: 0 }
    };
    this.frame();
  }

  _createClass(JoyCarClient, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      var url = this.inputUrl.value;
      var state = this.state.state;

      if (state != STATE_NOT_CONNECTED) {
        return;
      }
      this.socket = new WebSocket(url);
      this.state.state = STATE_CONNECTING;
      this.socket.onopen = function () {
        _this2.onConnected();
      };
      this.socket.onmessage = function (event) {
        _this2.onMessage(JSON.parse(event.data));
      };
      this.socket.onclose = function (event) {
        _this2.disconnect(true);
      };
    }
  }, {
    key: 'onConnected',
    value: function onConnected() {
      var _this3 = this;

      this.state.state = STATE_CONNECTED;
      this.divPanel.style.display = 'block';
      this.socket.send(JSON.stringify({ type: 'hello' }));
      this.inputUrl.disabled = true;
      this.btnOP.innerText = '断开';
      this.btnOP.onclick = function () {
        _this3.disconnect(false);
      };
    }
  }, {
    key: 'disconnect',
    value: function disconnect(bySocket) {
      var _this4 = this;

      var state = this.state.state;

      if (state == STATE_NOT_CONNECTED) {
        return;
      }
      this.divPanel.style.display = 'none';
      this.state.state = STATE_NOT_CONNECTED;
      this.inputUrl.disabled = undefined;
      this.btnOP.innerText = '连接';
      this.btnOP.onclick = function () {
        _this4.connect();
      };
      this.lastDirection = '';
      if (!bySocket) {
        this.socket.close();
      }
      this.socket = null;
    }
  }, {
    key: 'onMessage',
    value: function onMessage(msg) {
      var _this5 = this;

      if (msg.looping) {
        this.btnLock.innerText = '锁定';
        this.btnLock.onclick = function () {
          _this5.send({ type: 'lock' });
        };
      } else {
        this.btnLock.innerText = '解锁';
        this.btnLock.onclick = function () {
          _this5.send({ type: 'unlock' });
        };
      }

      this.lblDir.innerText = JSON.stringify(msg);

      console.log(msg);
    }
  }, {
    key: 'getState',
    value: function getState() {
      return _extends({}, this.state);
    }
  }, {
    key: 'send',
    value: function send(msg) {
      if (this.state.state == STATE_CONNECTED) {
        this.socket.send(JSON.stringify(msg));
      }
    }
  }, {
    key: 'frame',
    value: function frame() {
      var direction = this.getDirection();
      var dir = direction.left + ',' + direction.right;
      if (dir != this.lastDirection) {
        this.updateDir(direction);
        this.lastDirection = dir;
      }
      requestAnimationFrame(this.frame.bind(this));
    }
  }, {
    key: 'updateDir',
    value: function updateDir(direction) {
      console.log(direction);
      this.send({ type: 'speed', payload: direction });
    }
  }, {
    key: 'getDirection',
    value: function getDirection() {
      var joystick = this.joystick;
      var limit = 5000;
      var x = 0;
      var y = 0;
      var deltaX = joystick.deltaX();
      var deltaY = joystick.deltaY();
      if (deltaX * deltaX + deltaY * deltaY > limit) {
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

      var l = 0; // 0 停止 1 半速 2 全速
      var r = 0;
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

      return { left: l, right: r };
    }
  }]);

  return JoyCarClient;
}();

var client = new JoyCarClient({
  document: document
});

