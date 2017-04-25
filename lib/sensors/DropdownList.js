"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactSelect = require("react-select");

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _ChannelManager = require("../middleware/ChannelManager");

var _ChannelManager2 = _interopRequireDefault(_ChannelManager);

var _InitialLoader = require("../addons/InitialLoader");

var _InitialLoader2 = _interopRequireDefault(_InitialLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("lodash");
var helper = require("../middleware/helper");

var DropdownList = function (_Component) {
	_inherits(DropdownList, _Component);

	function DropdownList(props) {
		_classCallCheck(this, DropdownList);

		var _this = _possibleConstructorReturn(this, (DropdownList.__proto__ || Object.getPrototypeOf(DropdownList)).call(this, props));

		_this.state = {
			items: [],
			value: "",
			rawData: {
				hits: {
					hits: []
				}
			}
		};
		_this.sortObj = {
			aggSort: _this.props.sortBy
		};
		_this.selectAll = false;
		_this.channelId = null;
		_this.channelListener = null;
		_this.previousSelectedSensor = {};
		_this.defaultSelected = _this.props.defaultSelected;
		_this.handleChange = _this.handleChange.bind(_this);
		_this.type = _this.props.multipleSelect ? "Terms" : "Term";
		_this.customQuery = _this.customQuery.bind(_this);
		_this.renderOption = _this.renderOption.bind(_this);
		return _this;
	}

	// Get the items from Appbase when component is mounted


	_createClass(DropdownList, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			this.size = this.props.size;
			this.setQueryInfo();
			this.createChannel(true);
		}
	}, {
		key: "componentWillReceiveProps",
		value: function componentWillReceiveProps(nextProps) {
			var items = this.state.items;
			if (nextProps.selectAllLabel !== this.props.selectAllLabel) {
				if (this.props.selectAllLabel) {
					items.shift();
				}
				items.unshift({ label: nextProps.selectAllLabel, value: nextProps.selectAllLabel });
				this.setState({
					items: items
				});
			}
		}
	}, {
		key: "componentWillUpdate",
		value: function componentWillUpdate() {
			var _this2 = this;

			setTimeout(function () {
				if (_this2.props.multipleSelect) {
					if (!_.isEqual(_this2.defaultSelected, _this2.props.defaultSelected)) {
						_this2.defaultSelected = _this2.props.defaultSelected;
						var records = _this2.state.items.filter(function (record) {
							return _this2.defaultSelected.indexOf(record.value) > -1;
						});
						if (records.length) {
							setTimeout(_this2.handleChange.bind(_this2, records), 1000);
						}
					}
				} else if (_this2.defaultSelected !== _this2.props.defaultSelected) {
					_this2.defaultSelected = _this2.props.defaultSelected;
					var _records = _this2.state.items.filter(function (record) {
						return record.value === _this2.defaultSelected;
					});
					if (_records.length) {
						setTimeout(_this2.handleChange.bind(_this2, _records), 1000);
					}
				}
				if (_this2.sortBy !== _this2.props.sortBy) {
					_this2.sortBy = _this2.props.sortBy;
					_this2.handleSortSelect();
				}
				if (_this2.size !== _this2.props.size) {
					_this2.size = _this2.props.size;
					_this2.removeChannel();
					_this2.createChannel();
				}
			}, 300);
		}

		// stop streaming request and remove listener when component will unmount

	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			this.removeChannel();
		}
	}, {
		key: "removeChannel",
		value: function removeChannel() {
			if (this.channelId) {
				_ChannelManager2.default.stopStream(this.channelId);
			}
			if (this.channelListener) {
				this.channelListener.remove();
			}
			if (this.loadListener) {
				this.loadListener.remove();
			}
		}

		// build query for this sensor only

	}, {
		key: "customQuery",
		value: function customQuery(value) {
			if (this.selectAll) {
				return {
					exists: {
						field: [this.props.appbaseField]
					}
				};
			} else if (value) {
				return _defineProperty({}, this.type, _defineProperty({}, this.props.appbaseField, value));
			}
		}

		// set the query type and input data

	}, {
		key: "setQueryInfo",
		value: function setQueryInfo() {
			var obj = {
				key: this.props.componentId,
				value: {
					queryType: this.type,
					inputData: this.props.appbaseField,
					customQuery: this.props.customQuery ? this.props.customQuery : this.customQuery
				}
			};
			helper.selectedSensor.setSensorInfo(obj);
		}
	}, {
		key: "includeAggQuery",
		value: function includeAggQuery() {
			var obj = {
				key: this.props.componentId + "-sort",
				value: this.sortObj
			};
			helper.selectedSensor.setSortInfo(obj);
		}
	}, {
		key: "handleSortSelect",
		value: function handleSortSelect() {
			this.sortObj = {
				aggSort: this.props.sortBy
			};
			var obj = {
				key: this.props.componentId + "-sort",
				value: this.sortObj
			};
			if (this.props.onValueChange) {
				this.props.onValueChange(obj.value);
			}
			helper.selectedSensor.set(obj, true, "sortChange");
		}

		// Create a channel which passes the react and receive results whenever react changes

	}, {
		key: "createChannel",
		value: function createChannel() {
			var _this3 = this;

			var executeChannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			// Set the react - add self aggs query as well with react
			var react = this.props.react ? this.props.react : {};
			react.aggs = {
				key: this.props.appbaseField,
				sort: this.props.sortBy,
				size: this.props.size,
				sortRef: this.props.componentId + "-sort"
			};
			if (react && react.and && typeof react.and === "string") {
				react.and = [react.and];
			} else {
				react.and = react.and ? react.and : [];
			}
			react.and.push(this.props.componentId + "-sort");
			react.and.push("dropdownListChanges");
			this.includeAggQuery();
			// create a channel and listen the changes
			var channelObj = _ChannelManager2.default.create(this.context.appbaseRef, this.context.type, react);
			this.channelId = channelObj.channelId;
			this.channelListener = channelObj.emitter.addListener(channelObj.channelId, function (res) {
				if (res.error) {
					_this3.setState({
						queryStart: false
					});
				}
				if (res.appliedQuery) {
					var data = res.data;
					var rawData = void 0;
					if (res.mode === "streaming") {
						rawData = _this3.state.rawData;
						rawData.hits.hits.push(res.data);
					} else if (res.mode === "historic") {
						rawData = data;
					}
					_this3.setState({
						queryStart: false,
						rawData: rawData
					});
					_this3.setData(rawData);
				}
			});
			if (executeChannel) {
				setTimeout(function () {
					var obj = {
						key: "dropdownListChanges",
						value: ""
					};
					helper.selectedSensor.set(obj, true);
				}, 100);
			}
			this.listenLoadingChannel(channelObj);
		}
	}, {
		key: "listenLoadingChannel",
		value: function listenLoadingChannel(channelObj) {
			var _this4 = this;

			this.loadListener = channelObj.emitter.addListener(channelObj.channelId + "-query", function (res) {
				if (res.appliedQuery) {
					_this4.setState({
						queryStart: res.queryState
					});
				}
			});
		}
	}, {
		key: "setData",
		value: function setData(data) {
			if (data.aggregations && data.aggregations[this.props.appbaseField] && data.aggregations[this.props.appbaseField].buckets) {
				this.addItemsToList(data.aggregations[this.props.appbaseField].buckets);
			}
		}
	}, {
		key: "renderOption",
		value: function renderOption(option) {
			return _react2.default.createElement(
				"span",
				{ key: option.value },
				option.value,
				" ",
				this.props.showCount && option.count ? _react2.default.createElement(
					"span",
					{ className: "rbc-count" },
					option.count
				) : null
			);
		}
	}, {
		key: "addItemsToList",
		value: function addItemsToList(newItems) {
			var _this5 = this;

			newItems = newItems.map(function (item) {
				item.label = item.key.toString();
				item.value = item.key.toString();
				item.count = null;
				if (_this5.props.showCount) {
					item.count = item.doc_count;
				}
				return item;
			});
			if (this.props.selectAllLabel) {
				newItems.unshift({ label: this.props.selectAllLabel, value: this.props.selectAllLabel });
			}
			this.setState({
				items: newItems
			});
			if (this.defaultSelected) {
				if (this.props.multipleSelect) {
					var records = this.state.items.filter(function (record) {
						return _this5.defaultSelected.indexOf(record.value) > -1;
					});
					if (records.length) {
						this.handleChange(records);
					}
				} else {
					var _records2 = this.state.items.filter(function (record) {
						return record.value === _this5.defaultSelected;
					});
					if (_records2.length) {
						this.handleChange(_records2[0]);
					}
				}
			}
		}

		// Handler function when a value is selected

	}, {
		key: "handleChange",
		value: function handleChange(value) {
			var result = void 0;
			this.selectAll = false;
			if (this.props.multipleSelect) {
				result = [];
				value.map(function (item) {
					result.push(item.value);
				});
				if (this.props.selectAllLabel && result.indexOf(this.props.selectAllLabel) > -1) {
					result = this.props.selectAllLabel;
					this.selectAll = true;
				} else {
					result = result.join();
				}
			} else {
				result = value.value;
				if (this.props.selectAllLabel && result === this.props.selectAllLabel) {
					this.selectAll = true;
				}
			}
			this.setState({
				value: result
			});
			this.setValue(result, true);
		}

		// set value

	}, {
		key: "setValue",
		value: function setValue(value) {
			var isExecuteQuery = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			if (this.props.multipleSelect) {
				value = value.split(",");
			}
			var obj = {
				key: this.props.componentId,
				value: value
			};
			helper.selectedSensor.set(obj, isExecuteQuery);
		}
	}, {
		key: "render",
		value: function render() {
			// Checking if component is single select or multiple select
			var title = null;
			if (this.props.title) {
				title = _react2.default.createElement(
					"h4",
					{ className: "rbc-title col s12 col-xs-12" },
					this.props.title
				);
			}

			var cx = (0, _classnames2.default)({
				"rbc-title-active": this.props.title,
				"rbc-title-inactive": !this.props.title,
				"rbc-placeholder-active": this.props.placeholder,
				"rbc-placeholder-inactive": !this.props.placeholder,
				"rbc-multidropdownlist": this.props.multipleSelect,
				"rbc-singledropdownlist": !this.props.multipleSelect,
				"rbc-count-active": this.props.showCount,
				"rbc-count-inactive": !this.props.showCount,
				"rbc-initialloader-active": this.props.initialLoader,
				"rbc-initialloader-inactive": !this.props.initialLoader
			});

			return _react2.default.createElement(
				"div",
				{ className: "rbc col s12 col-xs-12 card thumbnail " + cx, style: this.props.componentStyle },
				_react2.default.createElement(
					"div",
					{ className: "row" },
					title,
					_react2.default.createElement(
						"div",
						{ className: "col s12 col-xs-12" },
						this.state.items.length ? _react2.default.createElement(_reactSelect2.default, {
							options: this.state.items,
							clearable: false,
							value: this.state.value,
							onChange: this.handleChange,
							multi: this.props.multipleSelect,
							cache: false,
							placeholder: this.props.placeholder,
							optionRenderer: this.renderOption,
							searchable: true
						}) : null
					)
				),
				this.props.initialLoader && this.state.queryStart ? _react2.default.createElement(_InitialLoader2.default, { defaultText: this.props.initialLoader }) : null
			);
		}
	}]);

	return DropdownList;
}(_react.Component);

exports.default = DropdownList;


DropdownList.propTypes = {
	componentId: _react2.default.PropTypes.string.isRequired,
	appbaseField: _react2.default.PropTypes.string.isRequired,
	title: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.element]),
	size: helper.sizeValidation,
	multipleSelect: _react2.default.PropTypes.bool,
	showCount: _react2.default.PropTypes.bool,
	sortBy: _react2.default.PropTypes.oneOf(["asc", "desc", "count"]),
	placeholder: _react2.default.PropTypes.string,
	selectAllLabel: _react2.default.PropTypes.string,
	initialLoader: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.element]),
	defaultSelected: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.array]),
	customQuery: _react2.default.PropTypes.func,
	react: _react2.default.PropTypes.object,
	onValueChange: _react2.default.PropTypes.func,
	componentStyle: _react2.default.PropTypes.object
};

// Default props value
DropdownList.defaultProps = {
	showCount: true,
	sortBy: "count",
	size: 100,
	title: null,
	placeholder: "Select...",
	selectAllLabel: null
};

// context type
DropdownList.contextTypes = {
	appbaseRef: _react2.default.PropTypes.any.isRequired,
	type: _react2.default.PropTypes.any.isRequired
};