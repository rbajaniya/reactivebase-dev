import { default as React, Component } from "react";
import { render } from "react-dom";
const _ = require("lodash");

export class HistoGramComponent extends Component {
	constructor(props) {
		super(props);
		this.style = {
			barContainer: {
				position: "relative",
				height: "50px",
				width: "100%"
			}
		};
	}
	createBars() {
		const max = _.max(this.props.data);
		const dataLength = this.props.data.length;
		let bars = null;
		const data = this.props.data.map((val) => {
			const res = {
				height: 0,
				count: 0,
				width: 100 / dataLength
			};
			try {
				res.height = (100 * val) / max;
				res.count = val;
				res.width = 100 / dataLength;
			} catch (e) {
				console.log(e);
			}
			return res;
		});
		if (dataLength) {
			bars = data.map((val, index) => (<Bar key={index} element={val} />));
		}
		return bars;
	}
	render() {
		const bars = this.createBars();
		return (
			<div className="rbc-bar-container col s12 col-xs-12" style={this.style.barContainer}>
				{bars}
			 </div>
		);
	}
}

export class Bar extends Component {
	constructor(props) {
		super(props);
		this.style = {
			bar: {
				display: "block",
				width: "100%",
				height: "100%"
			}
		};
	}
	render() {
		const element = this.props.element;
		const barStyle = {
			height: `${element.height}%`,
			width: `${element.width}%`,
			display: "inline-block",
			background: "#efefef",
			position: "relative"
		};
		return (
			<span className="rbc-bar-item" style={barStyle} >
				<span
					className="bar" style={this.style.bar}
					title={element.count}
				/>
			</span>
		);
	}
}
