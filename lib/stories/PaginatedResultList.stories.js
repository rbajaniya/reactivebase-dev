'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _app = require('../app.js');

var _helper = require('../middleware/helper.js');

var _Img = require('./Img.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('./list.css');

var PaginatedResultListDefault = function (_Component) {
	_inherits(PaginatedResultListDefault, _Component);

	function PaginatedResultListDefault(props) {
		_classCallCheck(this, PaginatedResultListDefault);

		var _this = _possibleConstructorReturn(this, (PaginatedResultListDefault.__proto__ || Object.getPrototypeOf(PaginatedResultListDefault)).call(this, props));

		_this.onData = _this.onData.bind(_this);
		_this.DEFAULT_IMAGE = 'http://www.avidog.com/wp-content/uploads/2015/01/BellaHead082712_11-50x65.jpg';
		return _this;
	}

	_createClass(PaginatedResultListDefault, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			(0, _helper.ResponsiveStory)();
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			(0, _helper.ResponsiveStory)();
		}
	}, {
		key: 'onData',
		value: function onData(res) {
			var _this2 = this;

			var result = void 0,
			    combineData = res.currentData;
			if (res.mode === 'historic') {
				combineData = res.currentData.concat(res.newData);
			}
			if (combineData) {
				result = combineData.map(function (markerData, index) {
					var marker = markerData._source;
					return _this2.itemMarkup(marker, markerData);
				});
			}
			return result;
		}
	}, {
		key: 'itemMarkup',
		value: function itemMarkup(marker, markerData) {
			return _react2.default.createElement(
				'a',
				{ className: 'full_row single-record single_record_for_clone',
					href: marker.event ? marker.event.event_url : '',
					target: '_blank',
					key: markerData._id },
				_react2.default.createElement(
					'div',
					{ className: 'img-container' },
					_react2.default.createElement(_Img.Img, { key: markerData._id, src: marker.member ? marker.member.photo : this.DEFAULT_IMAGE })
				),
				_react2.default.createElement(
					'div',
					{ className: 'text-container full_row' },
					_react2.default.createElement(
						'div',
						{ className: 'text-head text-overflow full_row' },
						_react2.default.createElement(
							'span',
							{ className: 'text-head-info text-overflow' },
							marker.member ? marker.member.member_name : '',
							' is going to ',
							marker.event ? marker.event.event_name : ''
						),
						_react2.default.createElement(
							'span',
							{ className: 'text-head-city' },
							marker.group ? marker.group.group_city : ''
						)
					),
					_react2.default.createElement(
						'div',
						{ className: 'text-description text-overflow full_row' },
						_react2.default.createElement(
							'ul',
							{ className: 'highlight_tags' },
							marker.group.group_topics.map(function (tag, i) {
								return _react2.default.createElement(
									'li',
									{ key: i },
									tag.topic_name
								);
							})
						)
					)
				)
			);
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				_app.ReactiveBase,
				{
					app: 'meetup_demo',
					username: 'LPpISlEBe',
					password: '2a8935f5-0f63-4084-bc3e-2b2b4d1a8e02',
					type: 'meetupdata1'
				},
				_react2.default.createElement(
					'div',
					{ className: 'row reverse-labels' },
					_react2.default.createElement(
						'div',
						{ className: 'col s6 col-xs-6' },
						_react2.default.createElement(_app.PaginatedResultList, _extends({
							componentId: 'SearchResult',
							appbaseField: this.props.mapping.topic,
							title: 'PaginatedResultList',
							sortBy: 'asc',
							from: 0,
							size: 20,
							onData: this.onData
						}, this.props, {
							actuate: {
								CitySensor: { "operation": "must" }
							}
						}))
					),
					_react2.default.createElement(
						'div',
						{ className: 'col s6 col-xs-6' },
						_react2.default.createElement(_app.SingleList, {
							componentId: 'CitySensor',
							appbaseField: this.props.mapping.city,
							title: 'Input Filter',
							showCount: true,
							size: 100,
							defaultSelected: 'London',
							searchPlaceholder: 'Search City'
						})
					)
				)
			);
		}
	}]);

	return PaginatedResultListDefault;
}(_react.Component);

exports.default = PaginatedResultListDefault;


PaginatedResultListDefault.defaultProps = {
	mapping: {
		city: 'group.group_city.raw',
		topic: 'group.group_topics.topic_name_raw'
	}
};