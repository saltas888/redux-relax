'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateConfigs = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var validateConfigs = exports.validateConfigs = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(configs) {
    var valid;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return schema.isValid(configs);

          case 2:
            valid = _context.sent;
            return _context.abrupt('return', valid);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function validateConfigs(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.throwError = throwError;
exports.normalizeObject = normalizeObject;
exports.capitalize = capitalize;
exports.createRequestTypes = createRequestTypes;
exports.action = action;

var _humps = require('humps');

var _normalizr = require('normalizr');

var _yup = require('yup');

var _yup2 = _interopRequireDefault(_yup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var schema = _yup2.default.object().shape({
  apiEndpoint: _yup2.default.string().required(),
  reducers: _yup2.default.object().shape({
    paginate: {
      totalPageCountField: _yup2.default.string().default('pages').required(),
      totalCountField: _yup2.default.string().default('totalCount').required(),
      currentPageField: _yup2.default.string().default(undefined) //optional
    }
  }),
  entities: _yup2.default.array().of(_yup2.default.object().shape({
    uniqueIdAttribute: _yup2.default.string().required().default('id'), //required
    name: _yup2.default.string().lowercase(), //required
    paginationExtraFields: _yup2.default.array().of(_yup2.default.string()),
    paginationKey: _yup2.default.string().required().default('id')
  }))
});

function throwError(message) {
  throw new Error('Redux-Relax:: ' + message);
}

function normalizeObject(json, schema) {
  var camelizedJson = (0, _humps.camelizeKeys)(json);
  return Object.assign({}, (0, _normalizr.normalize)(camelizedJson, schema));
}
function capitalize(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

var REQUEST = 'REQUEST';
var SUCCESS = 'SUCCESS';
var FAILURE = 'FAILURE';
var RESET = 'RESET';

function createRequestTypes(base) {
  var res = {};
  [REQUEST, SUCCESS, FAILURE, RESET].forEach(function (type) {
    return res[type] = base + '_' + type;
  });
  return res;
}

function action(type) {
  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return _extends({ type: type }, payload);
}