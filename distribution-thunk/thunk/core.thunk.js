'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLoadEntitysAction = exports.getLoadEntityFunctions = exports.getFetchActions = exports.getApiFetchActions = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _data = require('../shared/data');

var _data2 = _interopRequireDefault(_data);

var _utils = require('../shared/utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var inflect = require('i')();

function apiCallForEntity(entity, apiFn, url, data) {
  return function (dispatch, getState) {
    dispatch(entity.request(data));
    apiFn(url, data).then(function (_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response) {
        dispatch(entity.success(response, data));
        return response;
      } else {
        return dispatch(entity.failure(error, data));
      }
    });
  };
}
var getApiFetchActions = exports.getApiFetchActions = function getApiFetchActions(state) {
  return _data2.default.configs.entities.reduce(function (prev, curr) {
    var _extends2;

    var arraySchema = Utils.getSchemas()[curr.name];
    if (curr.itemsField) {
      arraySchema = _defineProperty({}, curr.itemsField, arraySchema);
    }

    var getFullUrl = function getFullUrl(url) {
      return url.indexOf('http') !== -1 ? url : _data2.default.configs.apiEndpoint + url;
    };
    return _extends((_extends2 = {}, _defineProperty(_extends2, curr.name, function (queryUrl) {
      return Utils.callApi(getFullUrl(curr.apiUrl(queryUrl)), 'GET', { schema: arraySchema, state: state });
    }), _defineProperty(_extends2, inflect.singularize(curr.name), function (id) {
      return Utils.callApi(getFullUrl(curr.singleApiUrl(id)), 'GET', { schema: Utils.getSchemas()[inflect.singularize(curr.name)], state: state });
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

    var entityFunctionOffest = Utils.capitalize(curr.name);

    var loadEntityBaseFunc = function loadEntityBaseFunc(query, loadMore) {
      return function (dispatch, getState) {
        var state = getState();

        var entityPaginationData = (0, _get2.default)(state, 'pagination.' + curr.name + '.' + (query || 'default'));

        var hasToLoadMore = entityPaginationData && entityPaginationData.pageCount < entityPaginationData.totalPages;

        if (!entityPaginationData || loadMore && hasToLoadMore) {
          if (!entityPaginationData) {
            return dispatch(getFetchActions(state)[curr.name](query, query));
          } else {
            var pageCount = entityPaginationData.pageCount;
            return dispatch(getFetchActions(state)[curr.name](query + '&page=' + (pageCount + 1), query));
          }
        }
      };
    };
    function loadSingleEntityBaseFunc() {
      var uniqueIdAttribute = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';

      return function (dispatch, getState) {
        var state = getState();
        var entity = (0, _get2.default)(state, 'entities.' + curr.name + '.' + uniqueIdAttribute);

        if (!entity) return dispatch(getFetchActions(state)[inflect.singularize(curr.name)](uniqueIdAttribute, uniqueIdAttribute));
      };
    }

    return _extends({}, prev, _defineProperty({}, curr.name, (_curr$name = {}, _defineProperty(_curr$name, 'load' + entityFunctionOffest, loadEntityBaseFunc), _defineProperty(_curr$name, 'load' + inflect.singularize(entityFunctionOffest), loadSingleEntityBaseFunc), _curr$name)));
  }, {});
};

var getLoadEntitysAction = exports.getLoadEntitysAction = function getLoadEntitysAction(entityName, single) {
  var entity = single ? inflect.singularize(entityName) : entityName;
  var entityFunctionOffest = Utils.capitalize(entity);

  return getLoadEntityFunctions()[entityName]['load' + entityFunctionOffest];
};