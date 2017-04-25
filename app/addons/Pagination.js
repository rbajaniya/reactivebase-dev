import React, { Component } from "react";
import classNames from "classnames";
import manager from "../middleware/ChannelManager";
const helper = require("../middleware/helper.js");

export default class Pagination extends Component {
	constructor(props, context) {
		super(props);
		this.state = {
			currentValue: 1,
			maxPageNumber: 1
		};
		this.handleChange = this.handleChange.bind(this);
		this.prePage = this.prePage.bind(this);
		this.nextPage = this.nextPage.bind(this);
		this.firstPage = this.firstPage.bind(this);
		this.lastPage = this.lastPage.bind(this);
	}

	// Set query information
	componentDidMount() {
		this.setQueryInfo();
		this.listenGlobal();
	}

	// stop streaming request and remove listener when component will unmount
	componentWillUnmount() {
		if (this.globalListener) {
			this.globalListener.remove();
		}
	}

	// set the query type and input data
	setQueryInfo() {
		const obj = {
			key: this.props.componentId,
			value: this.state.currentValue
		};
		helper.selectedSensor.setPaginationInfo(obj);
	}

	// listen all results
	listenGlobal() {
		this.globalListener = manager.emitter.addListener("global", (res) => {
			if (res.react && Object.keys(res.react).indexOf(this.props.componentId) > -1) {
				const totalHits = res.channelResponse && res.channelResponse.data && res.channelResponse.data.hits ? res.channelResponse.data.hits.total : 0;
				const maxPageNumber = Math.ceil(totalHits / res.queryOptions.size) < 1 ? 1 : Math.ceil(totalHits / res.queryOptions.size);
				const size = res.queryOptions.size ? res.queryOptions.size : 20;
				const currentPage = Math.round(res.queryOptions.from / size) + 1;
				this.setState({
					totalHits,
					size,
					maxPageNumber,
					currentValue: currentPage
				});
			}
		});
	}

	// handle the input change and pass the value inside sensor info
	handleChange(inputVal) {
		this.setState({
			currentValue: inputVal
		});
		const obj = {
			key: this.props.componentId,
			value: inputVal
		};

		// pass the selected sensor value with componentId as key,
		const isExecuteQuery = true;
		helper.selectedSensor.set(obj, isExecuteQuery, "paginationChange");
		if (this.props.onPageChange) {
			this.props.onPageChange(inputVal);
		}
	}

	// first page
	firstPage() {
		if (this.state.currentValue !== 1) {
			this.handleChange.call(this, 1);
		}
	}

	// last page
	lastPage() {
		if (this.state.currentValue !== this.state.maxPageNumber) {
			this.handleChange.call(this, this.state.maxPageNumber);
		}
	}

	// pre page
	prePage() {
		const currentValue = this.state.currentValue > 1 ? this.state.currentValue - 1 : 1;
		if (this.state.currentValue !== currentValue) {
			this.handleChange.call(this, currentValue);
		}
	}

	// next page
	nextPage() {
		const currentValue = this.state.currentValue < this.state.maxPageNumber ? this.state.currentValue + 1 : this.state.maxPageNumber;
		if (this.state.currentValue !== currentValue) {
			this.handleChange.call(this, currentValue);
		}
	}

	renderPageNumber() {
		let start,
			numbers = [];
		for (let i = this.state.currentValue; i > 0; i--) {
			if (i % 5 === 0 || i === 1) {
				start = i;
				break;
			}
		}
		for (let i = start; i <= start + 5; i++) {
			const singleItem = (
				<li key={i} className={`rbc-page-number ${this.state.currentValue === i ? "active rbc-pagination-active" : "waves-effect"}`}>
					<a onClick={() => this.handleChange(i)}>{i}</a>
				</li>);
			if (i <= this.state.maxPageNumber) {
				numbers.push(singleItem);
			}
		}
		return (
			<ul className="pagination">
				<li className={(this.state.currentValue === 1 ? "disabled" : "waves-effect")}><a className="rbc-page-previous" onClick={this.firstPage}><i className="fa fa-angle-double-left" /></a></li>
				<li className={(this.state.currentValue === 1 ? "disabled" : "waves-effect")}><a className="rbc-page-previous" onClick={this.prePage}><i className="fa fa-angle-left" /></a></li>
				{numbers}
				<li className={(this.state.currentValue === this.state.maxPageNumber ? "disabled" : "waves-effect")}><a className="rbc-page-next" onClick={this.nextPage}><i className="fa fa-angle-right" /></a></li>
				<li className={(this.state.currentValue === this.state.maxPageNumber ? "disabled" : "waves-effect")}><a className="rbc-page-previous" onClick={this.lastPage}><i className="fa fa-angle-double-right" /></a></li>
			</ul>
		);
	}

	// render
	render() {
		let title = null;
		const titleExists = false;
		if (this.props.title) {
			title = (<h4 className="rbc-title col s12 col-xs-12">{this.props.title}</h4>);
		}

		const cx = classNames({
			"rbc-title-active": this.props.title,
			"rbc-title-inactive": !this.props.title
		});

		return (
			<div className={`rbc rbc-pagination col s12 col-xs-12 ${cx} ${this.props.className}`}>
				{title}
				<div className="col s12 col-xs-12">
					{this.renderPageNumber()}
				</div>
			</div>
		);
	}
}

Pagination.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	title: React.PropTypes.string,
	onPageChange: React.PropTypes.func
};

// Default props value
Pagination.defaultProps = {};

// context type
Pagination.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};
