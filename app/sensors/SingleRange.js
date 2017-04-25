import React, { Component } from "react";
import classNames from "classnames";
const helper = require("../middleware/helper.js");
import * as TYPES from "../middleware/constants.js";

export default class SingleRange extends Component {
	constructor(props, context) {
		super(props);
		this.state = {
			selected: null
		};
		this.type = "range";
		this.defaultSelected = this.props.defaultSelected;
		this.handleChange = this.handleChange.bind(this);
		this.customQuery = this.customQuery.bind(this);
	}

	// Set query information
	componentDidMount() {
		this.setQueryInfo();
		if (this.defaultSelected) {
			const records = this.props.data.filter(record => record.label === this.defaultSelected);
			if (records && records.length) {
				setTimeout(this.handleChange.bind(this, records[0]), 1000);
			}
		}
	}

	componentWillUpdate() {
		setTimeout(() => {
			if (this.defaultSelected != this.props.defaultSelected) {
				this.defaultSelected = this.props.defaultSelected;
				const records = this.props.data.filter(record => record.label === this.defaultSelected);
				if (records && records.length) {
					setTimeout(this.handleChange.bind(this, records[0]), 1000);
				}
			}
		}, 300);
	}

	// set the query type and input data
	setQueryInfo() {
		const obj = {
			key: this.props.componentId,
			value: {
				queryType: this.type,
				inputData: this.props.appbaseField,
				customQuery: this.props.customQuery ? this.props.customQuery : this.customQuery
			}
		};
		helper.selectedSensor.setSensorInfo(obj);
	}

	// build query for this sensor only
	customQuery(record) {
		if (record) {
			return {
				range: {
					[this.props.appbaseField]: {
						gte: record.start,
						lte: record.end,
						boost: 2.0
					}
				}
			};
		}
	}

	// handle the input change and pass the value inside sensor info
	handleChange(record) {
		this.setState({
			selected: record
		});
		const obj = {
			key: this.props.componentId,
			value: record
		};
		// pass the selected sensor value with componentId as key,
		const isExecuteQuery = true;
		if (this.props.onValueChange) {
			this.props.onValueChange(obj.value);
		}
		helper.selectedSensor.set(obj, isExecuteQuery);
	}

	renderButtons() {
		let buttons;
		const selectedText = this.state.selected && this.state.selected.label ? this.state.selected.label : "";
		if (this.props.data) {
			buttons = this.props.data.map((record, i) => (
				<div className="rbc-list-item row" key={i} onClick={() => this.handleChange(record)}>
					<input
						type="radio"
						className="rbc-radio-item"
						checked={selectedText === record.label}
						value={record.label}
					/>
					<label className="rbc-label">{record.label}</label>
				</div>
				));
		}
		return buttons;
	}

	// render
	render() {
		let title = null;
		if (this.props.title) {
			title = (<h4 className="rbc-title col s12 col-xs-12">{this.props.title}</h4>);
		}

		const cx = classNames({
			"rbc-title-active": this.props.title,
			"rbc-title-inactive": !this.props.title
		});

		return (
			<div className={`rbc rbc-singlerange col s12 col-xs-12 card thumbnail ${cx}`} style={this.props.componentStyle}>
				<div className="row">
					{title}
					<div className="col s12 col-xs-12 rbc-list-container">
						{this.renderButtons()}
					</div>
				</div>
			</div>
		);
	}
}

SingleRange.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField: React.PropTypes.string.isRequired,
	title: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.element
	]),
	data: React.PropTypes.any.isRequired,
	defaultSelected: React.PropTypes.string,
	customQuery: React.PropTypes.func,
	onValueChange: React.PropTypes.func,
	componentStyle: React.PropTypes.object
};

// Default props value
SingleRange.defaultProps = {
	title: null,
	componentStyle: {}
};

// context type
SingleRange.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};

SingleRange.types = {
	componentId: TYPES.STRING,
	appbaseField: TYPES.STRING,
	appbaseFieldType: TYPES.NUMBER,
	title: TYPES.STRING,
	data: TYPES.OBJECT,
	defaultSelected: TYPES.STRING,
	customQuery: TYPES.FUNCTION,
	componentStyle: TYPES.OBJECT
};
