'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSchemas = exports.getActions = exports.getActionTypes = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.throwError = throwError;
exports.normalizeObject = normalizeObject;
exports.capitalize = capitalize;
exports.createRequestTypes = createRequestTypes;
exports.action = action;
exports.callApi = callApi;

var _humps = require('humps');

var _normalizr = require('normalizr');

var _yup = require('yup');

var _yup2 = _interopRequireDefault(_yup);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var inflect = require('i')();

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

// export async function validateConfigs(configs){
//   const valid = await schema.isValid(configs)
//   return valid
// }


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

function callApi(endpoint, requestType, _ref) {
  var schema = _ref.schema,
      state = _ref.state;

  return fetch(endpoint, {
    method: requestType,
    headers: _data2.default.configs.getHeaders(state)
  }).then(function (response) {
    return response.json().then(function (json) {
      return { json: json, response: response };
    });
  }).then(function (_ref2) {
    var json = _ref2.json,
        response = _ref2.response;

    if (!response.ok) {
      return Promise.reject(json);
    }
    if (schema) {
      return normalizeObject(json, schema);
    }
    return json;
  }).then(function (response) {
    return { response: response };
  }, function (error) {
    return { error: error.errors || error.message || error.error || error.exception || 'Something went wrong' };
  });
}

var getActionTypes = exports.getActionTypes = function getActionTypes() {
  return _data2.default.configs.entities.reduce(function (prev, curr, index) {
    var _extends2;

    return _extends((_extends2 = {}, _defineProperty(_extends2, curr.name.toUpperCase(), createRequestTypes(curr.name.toUpperCase())), _defineProperty(_extends2, inflect.singularize(curr.name).toUpperCase(), createRequestTypes(inflect.singularize(curr.name).toUpperCase())), _extends2), prev);
  }, {});
};

var getActions = exports.getActions = function getActions() {
  return _data2.default.configs.entities.reduce(function (prev, curr) {
    var _extends3;

    var entityName = curr.name.toUpperCase();
    return _extends((_extends3 = {}, _defineProperty(_extends3, curr.name, {
      request: function request(query) {
        return action(getActionTypes()[entityName].REQUEST, _defineProperty({}, curr.paginationKey || 'query', query));
      },
      success: function success(response, query) {
        return action(getActionTypes()[entityName].SUCCESS, _defineProperty({ response: response }, curr.paginationKey || 'query', query));
      },
      failure: function failure(error, query) {
        return action(getActionTypes()[entityName].FAILURE, _defineProperty({ error: error }, curr.paginationKey || 'query', query));
      }
    }), _defineProperty(_extends3, inflect.singularize(curr.name), {
      request: function request(id) {
        return action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].REQUEST, _defineProperty({}, curr.uniqueIdAttribute || 'id', id));
      },
      success: function success(response, id) {
        return action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].SUCCESS, _defineProperty({ response: response }, curr.uniqueIdAttribute || 'id', id));
      },
      failure: function failure(error, id) {
        return action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].FAILURE, _defineProperty({ error: error }, curr.uniqueIdAttribute || 'id', id));
      }
    }), _extends3), prev);
  }, {});
};

var getSchemas = exports.getSchemas = function getSchemas() {
  return _data2.default.configs.entities.reduce(function (prev, curr) {
    var _extends4;

    var entitySchema = new _normalizr.schema.Entity(curr.name, {}, { idAttribute: curr.uniqueIdAttribute });
    return _extends({}, prev, (_extends4 = {}, _defineProperty(_extends4, curr.name, new _normalizr.schema.Array(entitySchema)), _defineProperty(_extends4, inflect.singularize(curr.name), entitySchema), _extends4));
  }, {});
};