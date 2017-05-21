'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = paginate;

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _updeep3 = require('updeep');

var _updeep4 = _interopRequireDefault(_updeep3);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _Data$configs$reducer = _data2.default.configs.reducers.paginate,
    totalCountField = _Data$configs$reducer.totalCountField,
    totalPageCountField = _Data$configs$reducer.totalPageCountField,
    currentPageField = _Data$configs$reducer.currentPageField,
    itemsField = _Data$configs$reducer.itemsField;

// Creates a reducer managing pagination, given the action types to handle,
// and a function telling how to extract the key from an action.

function paginate(_ref) {
  var types = _ref.types,
      mapActionToKey = _ref.mapActionToKey,
      entity = _ref.entity,
      extraFields = _ref.extraFields,
      itemsField = _ref.itemsField;

  if (typeof mapActionToKey !== 'function') {
    throw new Error('Expected mapActionToKey to be a function.');
  }

  var requestTypes = types.requestTypes,
      successTypes = types.successTypes,
      failureTypes = types.failureTypes,
      resetTypes = types.resetTypes;


  var initialPaginateState = {
    isFetching: false,
    totalPages: null,
    pageCount: 0,
    nextPageUrl: null,
    totalCount: 0,
    ids: []
  };

  function updatePagination(key) {
    var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : initialPaginateState;
    var action = arguments[2];

    if ((0, _includes2.default)(requestTypes, action.type)) {
      return (0, _updeep4.default)({
        isFetching: true
      }, state);
    } else if ((0, _includes2.default)(failureTypes, action.type)) {
      return (0, _updeep4.default)({
        isFetching: false
      }, state);
    } else if ((0, _includes2.default)(successTypes, action.type)) {
      var entityData = _data2.default.configs.entities.find(function (e) {
        return e.name === entity;
      });

      var pageCount = currentPageField ? action.response.result[currentPageField] : state.pageCount + 1;

      var newData = {
        isFetching: false,
        ids: (0, _union2.default)(state.ids, itemsField ? action.response.result[itemsField] : action.response.result),
        totalPages: action.response.result[totalPageCountField],
        totalCount: action.response.result[totalCountField],
        pageCount: pageCount,
        nextPageUrl: '' + _data2.default.configs.apiEndpoint + entityData.apiUrl(key) + '?page=' + (pageCount + 1)
      };
      if (!(0, _isEmpty2.default)(extraFields)) {
        extraFields.forEach(function (f) {
          newData[f] = action.response.result[f];
        });
      }
      return (0, _updeep4.default)(newData, state);
    } else {
      return state;
    }
  }

  return function updatePaginationByKey() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var key = mapActionToKey(action);
    if ((0, _includes2.default)([].concat(_toConsumableArray(requestTypes), _toConsumableArray(failureTypes), _toConsumableArray(successTypes)), action.type)) {
      if (typeof key !== 'string') {
        throw new Error('Expected key to be a string.');
      }
      return (0, _updeep4.default)(_defineProperty({}, key, updatePagination(key, state[key], action)), state);
    } else if ((0, _includes2.default)(resetTypes, action.type)) {
      return (0, _updeep4.default)(_defineProperty({}, key, _updeep4.default.constant(initialPaginateState)), state);
    } else {
      return state;
    }
  };
}