'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLoadEntitysAction = exports.getWatchers = exports.getLoadEntityFunctions = exports.getFetchActions = exports.getApiFetchActions = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _normalizr = require('normalizr');

var _reduxSaga = require('redux-saga');

var _effects = require('redux-saga/effects');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _data = require('../shared/data');

var _data2 = _interopRequireDefault(_data);

var _utils = require('../shared/utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _marked = [apiCallForEntity].map(regeneratorRuntime.mark);

var inflect = require('i')();

function apiCallForEntity(entity, apiFn, url, data) {
  var _ref, response, error;

  return regeneratorRuntime.wrap(function apiCallForEntity$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _effects.put)(entity.request(data));

        case 2:
          _context.next = 4;
          return (0, _effects.call)(apiFn, url, data);

        case 4:
          _ref = _context.sent;
          response = _ref.response;
          error = _ref.error;

          if (!response) {
            _context.next = 13;
            break;
          }

          _context.next = 10;
          return (0, _effects.put)(entity.success(response, data));

        case 10:
          return _context.abrupt('return', response);

        case 13:
          _context.next = 15;
          return (0, _effects.put)(entity.failure(error, data));

        case 15:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

//TODO:: GET THE URL PARAMS IN ORDER TO HAVE DIFFERENT PAGINATION
var getApiFetchActions = exports.getApiFetchActions = function getApiFetchActions(state) {
  return _data2.default.configs.entities.reduce(function (prev, curr) {
    var _extends2;

    var arraySchema = Utils.getSchemas()[curr.name];
    if (curr.itemsField) {
      arraySchema = _defineProperty({}, curr.itemsField, arraySchema);
    }
    return _extends((_extends2 = {}, _defineProperty(_extends2, curr.name, function (queryUrl) {
      return Utils.callApi(_data2.default.configs.apiEndpoint + curr.apiUrl(queryUrl), 'GET', { schema: arraySchema, state: state });
    }), _defineProperty(_extends2, inflect.singularize(curr.name), function (id) {
      return Utils.callApi(_data2.default.configs.apiEndpoint + curr.singleApiUrl(id), 'GET', { schema: Utils.getSchemas()[inflect.singularize(curr.name)], state: state });
    }), _extends2), prev);
  }, {});
};

var getFetchActions = exports.getFetchActions = function getFetchActions(state) {
  return _data2.default.configs.entities.reduce(function (prev, curr) {
    var _extends3;

    return _extends({}, prev, (_extends3 = {}, _defineProperty(_extends3, curr.name, apiCallForEntity.bind(null, Utils.getActions()[curr.name], getApiFetchActions(state)[curr.name])), _defineProperty(_extends3, inflect.singularize(curr.name), apiCallForEntity.bind(null, Utils.getActions()[inflect.singularize(curr.name)], getApiFetchActions(state)[inflect.singularize(curr.name)])), _extends3));
  }, {});
};

var getLoadEntityFunctions = exports.getLoadEntityFunctions = function getLoadEntityFunctions() {
  return _data2.default.configs.entities.reduce(function (prev, curr) {
    var _curr$name;

    var _marked2 = [loadSingleEntityBaseFunc].map(regeneratorRuntime.mark);

    var entityFunctionOffest = Utils.capitalize(curr.name);

    var loadEntityBaseFunc = regeneratorRuntime.mark(function loadEntityBaseFunc(query, loadMore) {
      var state, entityPaginationData, hasToLoadMore, pageCount;
      return regeneratorRuntime.wrap(function loadEntityBaseFunc$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0, _effects.select)(function (state) {
                return state;
              });

            case 2:
              state = _context2.sent;
              _context2.next = 5;
              return (0, _effects.select)(function (state) {
                return (0, _get2.default)(state, 'pagination.' + curr.name + '.' + (query || 'default'));
              });

            case 5:
              entityPaginationData = _context2.sent;
              hasToLoadMore = entityPaginationData && entityPaginationData.pageCount < entityPaginationData.totalPages;

              if (!(!entityPaginationData || loadMore && hasToLoadMore)) {
                _context2.next = 16;
                break;
              }

              if (entityPaginationData) {
                _context2.next = 13;
                break;
              }

              _context2.next = 11;
              return (0, _effects.call)(getFetchActions(state)[curr.name], query, query);

            case 11:
              _context2.next = 16;
              break;

            case 13:
              pageCount = entityPaginationData.pageCount;
              _context2.next = 16;
              return (0, _effects.call)(getFetchActions(state)[curr.name], query + '&page=' + (pageCount + 1), query);

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, loadEntityBaseFunc, this);
    });
    function loadSingleEntityBaseFunc() {
      var uniqueIdAttribute = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';
      var state, entity;
      return regeneratorRuntime.wrap(function loadSingleEntityBaseFunc$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0, _effects.select)(function (state) {
                return state;
              });

            case 2:
              state = _context3.sent;
              _context3.next = 5;
              return (0, _effects.select)(function (state) {
                return (0, _get2.default)(state, 'entities.' + curr.name + '.' + uniqueIdAttribute);
              });

            case 5:
              entity = _context3.sent;

              if (entity) {
                _context3.next = 9;
                break;
              }

              _context3.next = 9;
              return (0, _effects.call)(getFetchActions(state)[inflect.singularize(curr.name)], uniqueIdAttribute, uniqueIdAttribute);

            case 9:
            case 'end':
              return _context3.stop();
          }
        }
      }, _marked2[0], this);
    }

    return _extends({}, prev, _defineProperty({}, curr.name, (_curr$name = {}, _defineProperty(_curr$name, 'watchLoad' + entityFunctionOffest, regeneratorRuntime.mark(function undefined() {
      var data;
      return regeneratorRuntime.wrap(function undefined$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!true) {
                _context4.next = 8;
                break;
              }

              _context4.next = 3;
              return (0, _effects.take)('LOAD_' + curr.name.toUpperCase());

            case 3:
              data = _context4.sent;
              _context4.next = 6;
              return (0, _effects.fork)(loadEntityBaseFunc, data[curr.paginationKey || 'query']);

            case 6:
              _context4.next = 0;
              break;

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, undefined, this);
    })), _defineProperty(_curr$name, 'watchLoadMore' + entityFunctionOffest, regeneratorRuntime.mark(function undefined() {
      var data;
      return regeneratorRuntime.wrap(function undefined$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!true) {
                _context5.next = 8;
                break;
              }

              _context5.next = 3;
              return (0, _effects.take)('LOAD_MORE_' + curr.name.toUpperCase());

            case 3:
              data = _context5.sent;
              _context5.next = 6;
              return (0, _effects.fork)(loadEntityBaseFunc, data[curr.paginationKey || 'query'], true);

            case 6:
              _context5.next = 0;
              break;

            case 8:
            case 'end':
              return _context5.stop();
          }
        }
      }, undefined, this);
    })), _defineProperty(_curr$name, 'load' + entityFunctionOffest, loadEntityBaseFunc), _defineProperty(_curr$name, 'watchLoad' + inflect.singularize(entityFunctionOffest), regeneratorRuntime.mark(function undefined() {
      var data;
      return regeneratorRuntime.wrap(function undefined$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (!true) {
                _context6.next = 8;
                break;
              }

              _context6.next = 3;
              return (0, _effects.take)('LOAD_' + inflect.singularize(curr.name).toUpperCase());

            case 3:
              data = _context6.sent;
              _context6.next = 6;
              return (0, _effects.fork)(loadSingleEntityBaseFunc, data[curr.uniqueIdAttribute]);

            case 6:
              _context6.next = 0;
              break;

            case 8:
            case 'end':
              return _context6.stop();
          }
        }
      }, undefined, this);
    })), _defineProperty(_curr$name, 'load' + inflect.singularize(entityFunctionOffest), loadSingleEntityBaseFunc), _curr$name)));
  }, {});
};

var getWatchers = exports.getWatchers = function getWatchers() {
  return _data2.default.configs.entities.reduce(function (prev, curr, index) {

    var entityFunctionOffest = Utils.capitalize(curr.name);
    var singeWatcher = [];
    curr.singleApiUrl && singeWatcher.push(getLoadEntityFunctions()[curr.name]['watchLoad' + inflect.singularize(entityFunctionOffest)]);
    return [getLoadEntityFunctions()[curr.name]['watchLoad' + entityFunctionOffest], getLoadEntityFunctions()[curr.name]['watchLoadMore' + entityFunctionOffest]].concat(_toConsumableArray(prev), singeWatcher);
  }, []);
};

var getLoadEntitysAction = exports.getLoadEntitysAction = function getLoadEntitysAction(entityName) {
  var entityFunctionOffest = Utils.capitalize(entityName);
  return getLoadEntityFunctions()[entityName]['load' + entityFunctionOffest];
};