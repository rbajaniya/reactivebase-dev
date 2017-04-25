import React, { Component } from "react";
import Select from "react-select";
import classNames from "classnames";
import manager from "../middleware/ChannelManager";
import * as TYPES from "../middleware/constants";

const _ = require("lodash");
const helper = require("../middleware/helper");

export default class DataSearch extends Component {
	// Search results often contain duplicate results, so display only unique values
	removeDuplicates(myArr, prop) {
		return myArr.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos);
	}

	constructor(props) {
		super(props);
		this.state = {
			items: [],
			currentValue: null,
			isLoading: false,
			options: [],
			rawData: {
				hits: {
					hits: []
				}
			}
		};
		this.type = "match_phrase";
		this.searchInputId = `internal-${this.props.componentId}`;
		this.channelId = null;
		this.channelListener = null;
		this.fieldType = typeof this.props.appbaseField;
		this.handleSearch = this.handleSearch.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.setValue = this.setValue.bind(this);
		this.defaultSearchQuery = this.defaultSearchQuery.bind(this);
		this.previousSelectedSensor = {};
	}

	// Get the items from Appbase when component is mounted
	componentDidMount() {
		this.setQueryInfo();
		this.createChannel();
		this.checkDefault();
	}

	componentWillUpdate() {
		this.checkDefault();
	}

	// stop streaming request and remove listener when component will unmount
	componentWillUnmount() {
		if (this.channelId) {
			manager.stopStream(this.channelId);
		}
		if (this.channelListener) {
			this.channelListener.remove();
		}
	}

	highlightQuery() {
		const fields = {};
		const highlightFields = this.props.highlightFields ? this.props.highlightFields : this.props.appbaseField;
		if (typeof highlightFields === "string") {
			fields[highlightFields] = {};
		} else if (_.isArray(highlightFields)) {
			highlightFields.forEach((item) => {
				fields[item] = {};
			});
		}
		return {
			highlight: {
				pre_tags: ["<span class=\"rbc-highlight\">"],
				post_tags: ["</span>"],
				fields
			}
		};
	}

	// set the query type and input data
	setQueryInfo() {
		const obj = {
			key: this.props.componentId,
			value: {
				queryType: this.type,
				inputData: this.props.appbaseField,
				customQuery: this.props.customQuery ? this.props.customQuery : this.defaultSearchQuery
			}
		};
		if (this.props.highlight) {
			obj.value.externalQuery = this.highlightQuery();
		}
		helper.selectedSensor.setSensorInfo(obj);
		const searchObj = {
			key: this.searchInputId,
			value: {
				queryType: "multi_match",
				inputData: this.props.appbaseField,
				customQuery: this.defaultSearchQuery
			}
		};
		helper.selectedSensor.setSensorInfo(searchObj);
	}

	// set value to search
	setValue(value) {
		const obj = {
			key: this.searchInputId,
			value
		};
		helper.selectedSensor.set(obj, true);
		if (value && value.trim() !== "") {
			this.setState({
				options: [{
					label: value,
					value
				}],
				isLoadingOptions: true,
				currentValue: value
			});
		} else {
			this.setState({
				options: [],
				isLoadingOptions: false,
				currentValue: value
			});
		}
	}

	getValue(field, hit, index = 0) {
		let val;
		if (_.has(hit, field)) {
			val = hit[field];
		} else if (field.indexOf(".") > -1) {
			let prefix = "";
			const fieldSplit = field.split(".");
			fieldSplit.forEach((item, index) => {
				prefix += item;
				if (_.isArray(_.get(hit, prefix))) {
					prefix += `[${index}]`;
				}
				if (fieldSplit.length - 1 !== index) {
					prefix += ".";
				} else {
					val = _.get(hit, prefix);
				}
			});
		}
		return val;
	}

	// set data after get the result
	setData(data) {
		let options = [];
		const appbaseField = _.isArray(this.props.appbaseField) ? this.props.appbaseField : [this.props.appbaseField];
		data.hits.hits.map((hit) => {
			if (this.fieldType === "string") {
				const tempField = this.getValue(this.props.appbaseField.trim(), hit._source);
				options.push({ value: tempField, label: tempField });
			} else if (this.fieldType === "object") {
				this.props.appbaseField.map((field) => {
					const tempField = this.getValue(field, hit._source);
					if (tempField) {
						options.push({ value: tempField, label: tempField });
					}
				});
			}
		});
		if (this.state.currentValue && this.state.currentValue.trim() !== "") {
			options.unshift({
				label: this.state.currentValue,
				value: this.state.currentValue
			});
		}
		options = this.removeDuplicates(options, "label");
		this.setState({
			options,
			isLoadingOptions: false
		});
	}

	// default query
	defaultSearchQuery(value) {
		let finalQuery = null,
			fields;
		if (value) {
			if (this.fieldType === "string") {
				fields = [this.props.appbaseField];
			} else {
				fields = this.props.appbaseField;
			}
			finalQuery = {
				bool: {
					should: [{
						multi_match: {
							query: value,
							fields,
							type: "phrase_prefix"
						}
					}, {
						multi_match: {
							query: value,
							fields
						}
					}],
					minimum_should_match: "1"
				}
			};
		}
		return finalQuery;
	}

	// Create a channel which passes the react and receive results whenever react changes
	createChannel() {
		const react = this.props.react ? this.props.react : {};
		if (react && react.and && typeof react.and === "string") {
			react.and = [react.and];
		} else {
			react.and = react.and ? react.and : [];
		}
		react.and.push(this.searchInputId);
		const channelObj = manager.create(this.context.appbaseRef, this.context.type, react);
		this.channelId = channelObj.channelId;
		this.channelListener = channelObj.emitter.addListener(channelObj.channelId, (res) => {
			const data = res.data;
			let rawData;
			if (res.mode === "streaming") {
				rawData = this.state.rawData;
				rawData.hits.hits.push(res.data);
			} else if (res.mode === "historic") {
				rawData = data;
			}
			this.setState({
				rawData
			});
			if (this.props.autocomplete) {
				this.setData(rawData);
			}
		});
	}

	checkDefault() {
		if (this.props.defaultSelected && this.defaultSelected !== this.props.defaultSelected) {
			this.defaultSelected = this.props.defaultSelected;
			setTimeout(this.setValue.bind(this, this.defaultSelected), 100);
			this.handleSearch({
				value: this.defaultSelected
			});
		}
	}

	// When user has selected a search value
	handleSearch(currentValue) {
		let value = currentValue ? currentValue.value : null;
		value = value === "null" ? null : value;
		const obj = {
			key: this.props.componentId,
			value
		};
		helper.selectedSensor.set(obj, true);
		this.setState({
			currentValue: value
		});
	}

	handleInputChange(event) {
		const inputVal = event.target.value;
		this.setState({
			currentValue: inputVal
		});
		const obj = {
			key: this.props.componentId,
			value: inputVal
		};
		if (this.props.onValueChange) {
			this.props.onValueChange(obj.value);
		}
		// pass the selected sensor value with componentId as key,
		const isExecuteQuery = true;
		helper.selectedSensor.set(obj, isExecuteQuery);
	}

	render() {
		let title = null;
		if (this.props.title) {
			title = (<h4 className="rbc-title col s12 col-xs-12">{this.props.title}</h4>);
		}
		const cx = classNames({
			"rbc-title-active": this.props.title,
			"rbc-title-inactive": !this.props.title,
			"rbc-placeholder-active": this.props.placeholder,
			"rbc-placeholder-inactive": !this.props.placeholder,
			"rbc-autocomplete-active": this.props.autocomplete,
			"rbc-autocomplete-inactive": !this.props.autocomplete
		});

		return (
			<div className={`rbc rbc-datasearch col s12 col-xs-12 card thumbnail ${cx}`} style={this.props.componentStyle}>
				{title}
				{
					this.props.autocomplete ?
						<Select
							isLoading={this.state.isLoadingOptions}
							value={this.state.currentValue}
							options={this.state.options}
							onInputChange={this.setValue}
							onChange={this.handleSearch}
							onBlurResetsInput={false}
							{...this.props}
						/> :
						<div className="rbc-search-container col s12 col-xs-12">
							<input
								type="text"
								className="rbc-input"
								placeholder={this.props.placeholder}
								value={this.state.currentValue ? this.state.currentValue : ""}
								onChange={this.handleInputChange}
							/>
							<span className="rbc-search-icon" />
						</div>
				}
			</div>
		);
	}
}

DataSearch.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.arrayOf(React.PropTypes.string)
	]),
	title: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.element
	]),
	placeholder: React.PropTypes.string,
	autocomplete: React.PropTypes.bool,
	defaultSelected: React.PropTypes.string,
	customQuery: React.PropTypes.func,
	onValueChange: React.PropTypes.func,
	react: React.PropTypes.object,
	componentStyle: React.PropTypes.object,
	highlight: React.PropTypes.bool,
	highlightFields: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.arrayOf(React.PropTypes.string)
	])
};

// Default props value
DataSearch.defaultProps = {
	placeholder: "Search",
	autocomplete: true,
	componentStyle: {},
	highlight: false
};

// context type
DataSearch.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};

DataSearch.types = {
	componentId: TYPES.STRING,
	appbaseField: TYPES.STRING,
	appbaseFieldType: TYPES.STRING,
	react: TYPES.OBJECT,
	title: TYPES.STRING,
	placeholder: TYPES.STRING,
	autocomplete: TYPES.BOOLEAN,
	defaultSelected: TYPES.STRING,
	customQuery: TYPES.FUNCTION,
	componentStyle: TYPES.OBJECT,
	highlight: TYPES.BOOLEAN
};
