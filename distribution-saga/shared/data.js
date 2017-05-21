'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Data = function () {
  function Data() {
    _classCallCheck(this, Data);

    this._configs = _config2.default;
  }

  _createClass(Data, [{
    key: 'reinitialize',
    value: function reinitialize(configs) {
      // const test = await Utils.validateConfigs(configs)
      // if(!test) throw new Error('error')
      this._configs = (0, _merge2.default)(this._configs, configs);
    }
  }, {
    key: 'configs',
    get: function get() {
      return this._configs;
    }
  }, {
    key: 'autoEntities',
    get: function get() {
      return this._configs.entities.filter(function (entity) {
        return !entity.auto;
      });
    }
  }]);

  return Data;
}();

exports.default = new Data();