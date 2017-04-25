import React, { Component } from "react";
import classNames from "classnames";
const helper = require("../middleware/helper.js");
import * as TYPES from "../middleware/constants.js";

const TitleComponent = props => (
	<h4 className="rbc-title col s12 col-xs-12">{props.title}</h4>
);

const NumberBoxButtonComponent = (props) => {
	const cx = classNames({
		"rbc-btn-active": props.isActive,
		"rbc-btn-inactive": !props.isActive
	});
	const { type } = props;
	const increment = type == "plus" ? 1 : -1;

	return (
		<button className={`btn rbc-btn ${cx}`} onClick={props.isActive && (() => props.handleChange(increment))}>
			<span className={`fa fa-${type} rbc-icon`} />
		</button>
	);
};

const NumberComponent = (props) => {
	const { label, end, start, handleChange } = props;
	const value = props.value != undefined ? props.value : start;
	const isPlusActive = end != undefined ? value < end : true;
	const isMinusActive = start != undefined ? value > start : true;

	return (
		<div className="rbc-numberbox-container col s12 col-xs-12">
			<div className="rbc-label">{label}</div>
			<div className="rbc-numberbox-btn-container">
				<NumberBoxButtonComponent isActive={isMinusActive} handleChange={handleChange} type="minus" />
				<span className="rbc-numberbox-number">{value}</span>
				<NumberBoxButtonComponent isActive={isPlusActive} handleChange={handleChange} type="plus" />
			</div>
		</div>
	);
};

export default class NumberBox extends Component {
	constructor(props, context) {
		super(props);
		const { defaultSelected, focused } = this.props;
		this.state = {
			currentValue: defaultSelected,
			focused
		};
		this.type = "term";
		this.handleChange = this.handleChange.bind(this);
		this.customQuery = this.customQuery.bind(this);
	}

	componentDidMount() {
		this.setQueryInfo();
		setTimeout(this.handleChange.bind(this), 1000);
	}

	componentWillReceiveProps(nextProps) {
		setTimeout(() => {
			if (nextProps.defaultSelected !== this.state.currentValue) {
				this.setState({
					currentValue: nextProps.defaultSelected
				});
			}
		}, 300);
	}

	// build query for this sensor only
	customQuery(value) {
		return {
			[this.type]: {
				[this.props.appbaseField]: value
			}
		};
	}

	setQueryInfo() {
		const { componentId, appbaseField } = this.props;
		const obj = {
			key: componentId,
			value: {
				queryType: this.type,
				inputData: appbaseField,
				customQuery: this.props.customQuery ? this.props.customQuery : this.customQuery
			}
		};
		helper.selectedSensor.setSensorInfo(obj);
	}

	// handle the input change and pass the value inside sensor info
	handleChange(increment = 0) {
		const { componentId, data } = this.props;
		let { start, end } = data;
		let inputVal = this.state.currentValue;

		start = start != undefined ? start : inputVal - 1;
		end = end != undefined ? end : inputVal + 1;

		if (increment > 0 && inputVal < end) {
			inputVal += 1;
		} else if (increment < 0 && inputVal > start) {
			inputVal -= 1;
		}

		this.setState({
			currentValue: inputVal
		});

		const obj = {
			key: componentId,
			value: inputVal
		};
		if (this.props.onValueChange) {
			this.props.onValueChange(obj.value);
		}
		helper.selectedSensor.set(obj, true);
	}

	render() {
		const { title, data, labelPosition } = this.props;
		const { currentValue } = this.state;
		const ComponentTitle = title ? <TitleComponent title={title} /> : null;
		const cx = classNames({
			"rbc-title-active": title,
			"rbc-title-inactive": !title
		});
		return (
			<div className={`rbc rbc-numberbox col s12 col-xs-12 card thumbnail ${cx} rbc-label-${labelPosition}`} style={this.props.componentStyle}>
				<div className="row">
					{ComponentTitle}
					<NumberComponent
						handleChange={this.handleChange}
						value={currentValue}
						label={data.label}
						start={data.start}
						end={data.end}
					/>
				</div>
			</div>
		);
	}
}

NumberBox.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField: React.PropTypes.string.isRequired,
	title: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.element
	]),
	data: React.PropTypes.shape({
		start: helper.validateThreshold,
		end: helper.validateThreshold,
		label: React.PropTypes.string
	}),
	defaultSelected: helper.valueValidation,
	labelPosition: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
	customQuery: React.PropTypes.func,
	onValueChange: React.PropTypes.func,
	componentStyle: React.PropTypes.object
};

NumberBox.defaultProps = {
	componentStyle: {}
};

// context type
NumberBox.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};

NumberBox.types = {
	componentId: TYPES.STRING,
	appbaseField: TYPES.STRING,
	appbaseFieldType: TYPES.NUMBER,
	title: TYPES.STRING,
	data: TYPES.OBJECT,
	defaultSelected: TYPES.NUMBER,
	labelPosition: TYPES.STRING,
	customQuery: TYPES.FUNCTION,
	componentStyle: TYPES.OBJECT
};
