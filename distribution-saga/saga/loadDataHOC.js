'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.single = exports.multiple = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _utils = require('../shared/utils');

var Utils = _interopRequireWildcard(_utils);

var _data = require('../shared/data');

var _data2 = _interopRequireDefault(_data);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var inflect = require('i')();

var multiple = exports.multiple = function multiple(entity, dataRetriever) {
  return function (WrappedComponent) {
    var entityData = _data2.default.configs.entities.find(function (e) {
      return e.name === entity;
    });

    var Connected = function (_React$Component) {
      _inherits(Connected, _React$Component);

      function Connected() {
        _classCallCheck(this, Connected);

        return _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).apply(this, arguments));
      }

      _createClass(Connected, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          // if(nextProps[entity] !== this.props[entity] || nextProps.isFetching !== this.props.isFetching) return true
          return true;
        }
      }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.props['load' + Utils.capitalize(entity)](dataRetriever(this.props.state, this.props).search || 'default');
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedComponent, this.props);
        }
      }]);

      return Connected;
    }(_react2.default.Component);

    function mapDispatchToProps(dispatch) {
      var _bindActionCreators;

      return (0, _redux.bindActionCreators)((_bindActionCreators = {}, _defineProperty(_bindActionCreators, 'load' + Utils.capitalize(entity), function undefined(query) {
        return Utils.action('LOAD_' + entity.toUpperCase(), _defineProperty({}, entityData.paginationKey || 'query', query));
      }), _defineProperty(_bindActionCreators, 'loadMore' + Utils.capitalize(entity), function undefined(query) {
        return Utils.action('LOAD_MORE_' + entity.toUpperCase(), _defineProperty({}, entityData.paginationKey || 'query', query));
      }), _bindActionCreators), dispatch);
    }

    function mapStateToProps(state, ownProps) {
      var entities = (0, _get2.default)(state, 'entities.' + entity);
      var entityPaginationData = (0, _get2.default)(state, 'pagination.' + entity + '.' + (dataRetriever(state, ownProps).search || 'default')) || { ids: [] };
      var data = entityPaginationData.ids.map(function (id) {
        return entities[id];
      });
      return _extends(_defineProperty({
        state: state
      }, entity, data), (0, _omit2.default)(entityPaginationData, ['ids']));
    }

    return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Connected);
  };
};

var single = exports.single = function single(entity, idRetriever) {

  return function (WrappedComponent) {
    var entityData = _data2.default.configs.entities.find(function (e) {
      return e.name === entity;
    });
    var loadEntityFuncName = 'load' + Utils.capitalize(inflect.singularize(entity));

    var Connected = function (_React$Component2) {
      _inherits(Connected, _React$Component2);

      function Connected() {
        _classCallCheck(this, Connected);

        return _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).apply(this, arguments));
      }

      _createClass(Connected, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          // if(nextProps[inflect.singularize(entity)] !== this.props[inflect.singularize(entity)]) return true
          return true;
        }
      }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.props[loadEntityFuncName](idRetriever(this.props.state, this.props));
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedComponent, this.props);
        }
      }]);

      return Connected;
    }(_react2.default.Component);

    function mapDispatchToProps(dispatch) {
      return (0, _redux.bindActionCreators)(_defineProperty({}, loadEntityFuncName, function (id) {
        return Utils.action('LOAD_' + inflect.singularize(entity).toUpperCase(), _defineProperty({}, entityData.uniqueIdAttribute || 'id', id));
      }), dispatch);
    }

    function mapStateToProps(state, ownProps) {

      var data = (0, _get2.default)(state, 'entities.' + entity + '.' + idRetriever(state, ownProps));
      return _defineProperty({
        state: state
      }, inflect.singularize(entity), data);
    }

    return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Connected);
  };
};