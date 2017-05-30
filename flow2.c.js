/*
* @Author: Ian Hu
* @Date:   2017-05-30 14:52:58
* @Last Modified by:   Ian Hu
* @Last Modified time: 2017-05-30 16:56:40
*/

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JoyCarServer = function () {
  function JoyCarServer(props) {
    _classCallCheck(this, JoyCarServer);

    //super(props)
    this.pins = props.pins || {
      left: ['P8_07', 'P8_08'],
      right: ['P8_09', 'P8_10']
    };
    this.context = props.context;
    this.flow = props.flow;
    this.global = this.context.global;
    this.node = props.node;
    this.state = {
      looping: false,
      direction: { left: 0, right: 0 }
    };
    this.timer = false;
  }

  _createClass(JoyCarServer, [{
    key: 'unlock',
    value: function unlock() {
      if (this.state.looping) {
        return;
      }
      var ret = this.initPins();
      if (ret) {
        this.state.looping = true;
        this.timer = setInterval(this.loop.bind(this), 1000 / 20);
      }
    }
  }, {
    key: 'lock',
    value: function lock() {
      if (!this.state.looping) {
        return;
      }
      clearInterval(this.timer);
      this.state.looping = false;
      this.initPins();
    }
  }, {
    key: 'initPins',
    value: function initPins() {
      var b = this.global.get('octalbonescript');

      var _arr = [].concat(_toConsumableArray(this.pins.left), _toConsumableArray(this.pins.right));

      for (var _i = 0; _i < _arr.length; _i++) {
        var pin = _arr[_i];
        var ret = b.pinModeSync(pin, b.OUTPUT);
        if (ret) {
          continue;
        }
        return ret;
      }
      return true;
    }
  }, {
    key: 'loop',
    value: function loop() {
      var _state$direction = this.state.direction,
          _state$direction$left = _state$direction.left,
          left = _state$direction$left === undefined ? 0 : _state$direction$left,
          _state$direction$righ = _state$direction.right,
          right = _state$direction$righ === undefined ? 0 : _state$direction$righ;
      var _pins = this.pins,
          leftPins = _pins.left,
          rightPins = _pins.right;


      if (Math.abs(left) != 1) {
        this.outputPins(left, leftPins);
      } else {
        this.outputPins(0, leftPins);
      }

      if (Math.abs(right) != 1) {
        this.outputPins(right, rightPins);
      } else {
        this.outputPins(0, rightPins);
      }
    }
  }, {
    key: 'outputPins',
    value: function outputPins(speed, pins) {
      var b = this.global.get('octalbonescript');
      b.digitalWrite(pins[0], speed > 0 ? b.HIGH : b.LOW);
      b.digitalWrite(pins[1], speed < 0 ? b.HIGH : b.LOW);
    }
  }, {
    key: 'setSpeed',
    value: function setSpeed(direction) {
      if (this.state.looping) {
        this.state.direction = _extends({}, this.state.direction, direction);
      }
    }
  }, {
    key: 'onMessage',
    value: function onMessage(msg) {
      var content = JSON.parse(msg.payload || '{}');
      if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) != 'object') {
        content = {};
      }
      var _content = content,
          _content$type = _content.type,
          type = _content$type === undefined ? 'unknown' : _content$type,
          _content$payload = _content.payload,
          payload = _content$payload === undefined ? {} : _content$payload;

      switch (type) {
        case 'unlock':
          this.unlock();
          break;
        case 'speed':
          this.setSpeed(payload);
          break;
        case 'lock':
          this.lock();
          break;
      }

      this.node.status(this.getStatus());
      return { payload: _extends({}, this.state) };
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      var status = { fill: 'red', shape: 'ring', text: 'locked' };
      status.text = 'locked';
      var _state$direction2 = this.state.direction,
          _state$direction2$lef = _state$direction2.left,
          left = _state$direction2$lef === undefined ? 0 : _state$direction2$lef,
          _state$direction2$rig = _state$direction2.right,
          right = _state$direction2$rig === undefined ? 0 : _state$direction2$rig;

      if (this.state.looping) {
        status = {
          fill: 'green',
          shape: 'dot',
          text: left + ',' + right
        };
      }
      return status;
    }
  }]);

  return JoyCarServer;
}();

function onMessage(msg, context, flow, node) {
  var instance = context.get('instance') || null;
  if (instance == null) {
    instance = new JoyCarServer({
      pins: {
        left: ['P8_07', 'P8_08'],
        right: ['P8_09', 'P8_10']
      },
      context: context,
      flow: flow,
      node: node
    });
    context.set('instance', instance);
  }
  return instance.onMessage(msg);
}

onMessage(msg, context, flow, node);

