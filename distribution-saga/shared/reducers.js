'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _redux = require('redux');

var _paginate = require('./paginate');

var _paginate2 = _interopRequireDefault(_paginate);

var _utils = require('./utils');

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = function (entitiesData) {
  var entitiesState = entitiesData.reduce(function (prev, entity) {
    return _extends({}, prev, _defineProperty({}, entity.name, {}));
  }, {});

  function entities() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : entitiesState;
    var action = arguments[1];

    if (action.response && action.response.entities) {
      return (0, _updeep2.default)(action.response.entities, state);
    }
    return state;
  }

  var pagination = (0, _redux.combineReducers)(_extends({}, entitiesData.reduce(function (prev, entity) {
    var Action = (0, _utils.getActionTypes)()[entity.name.toUpperCase()];
    return _extends({}, prev, _defineProperty({}, entity.name, (0, _paginate2.default)({
      entity: entity.name,
      extraFields: entity.paginationExtraFields,
      itemsField: entity.itemsField,
      mapActionToKey: function mapActionToKey(action) {
        return entity.paginationKey ? action[entity.paginationKey] : 'default';
      },
      types: {
        requestTypes: [Action.REQUEST],
        successTypes: [Action.SUCCESS],
        failureTypes: [Action.FAILURE],
        resetTypes: [Action.RESET]
      }
    })));
  }, {})));
  return { pagination: pagination, entities: entities };
};