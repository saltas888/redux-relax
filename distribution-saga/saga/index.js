'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Utils = exports.Core = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _redux = require('redux');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require('redux-saga/effects');

var _reduxLogger = require('redux-logger');

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _data = require('../shared/data');

var _data2 = _interopRequireDefault(_data);

var _reducers = require('../shared/reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _utils = require('../shared/utils');

var utils = _interopRequireWildcard(_utils);

var _core = require('./core');

var ReduxRelaxCore = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Core = exports.Core = ReduxRelaxCore;
var Utils = exports.Utils = utils;

exports.default = function (configs) {
  var enhancers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var propsMiddlewares = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  configs && _data2.default.reinitialize(configs);
  return function (next) {
    return function (reducer, initialState) {
      var sagaMiddleware = (0, _reduxSaga2.default)();
      var middlewares = configs.dev ? [sagaMiddleware].concat(_toConsumableArray(propsMiddlewares), [(0, _reduxLogger.createLogger)()]) : [sagaMiddleware].concat(_toConsumableArray(propsMiddlewares));
      var baseEnhancer = configs.dev ? _redux.compose.apply(undefined, [_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares))].concat(_toConsumableArray(enhancers))) : _redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares));
      var store = next(initializeReducers(reducer), initialState, (0, _redux.compose)(_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares)), baseEnhancer));

      store.runSaga = sagaMiddleware.run;
      store.close = function () {
        return store.dispatch(_reduxSaga.END);
      };
      store.runSaga(rootSaga);

      return store;
    };
  };
};

var rootSaga = regeneratorRuntime.mark(function rootSaga() {
  return regeneratorRuntime.wrap(function rootSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return ReduxRelaxCore.getWatchers().map(function (watcher) {
            return (0, _effects.fork)(watcher);
          });

        case 2:
        case 'end':
          return _context.stop();
      }
    }
  }, rootSaga, this);
});

function initializeReducers(reducer) {
  // Call the reducer with empty action to populate the initial state
  var relaxReducers = (0, _reducers2.default)(_data2.default.configs.entities);

  var initialState = _extends({
    entities: relaxReducers.entities(undefined, {}),
    pagination: relaxReducers.pagination(undefined, {})
  }, reducer(undefined, {}));
  // Return a reducer that handles undo and redo
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    // Delegate handling the action to the passed reducer
    var otherState = reducer((0, _omit2.default)(state, ['entities', 'pagination']), action);
    var entitiesState = relaxReducers.entities(state.entities, action);
    var paginationState = relaxReducers.pagination(state.pagination, action);
    return _extends({}, otherState, {
      entities: entitiesState,
      pagination: paginationState
    });
  };
}