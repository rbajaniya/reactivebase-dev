import React, { Component } from "react";
import { ReactiveBase, SingleRange, ReactiveList } from "../app.js";
import { ResponsiveStory } from "../middleware/helper.js";

export default class SingleRangeDefault extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		ResponsiveStory();
	}

	onData(markerData) {
		const marker = markerData._source;
		return (
			<a
				className="full_row single-record single_record_for_clone"
				href="#"
				key={markerData._id}
			>
				<div className="text-container full_row" style={{ paddingLeft: "10px" }}>
					<div className="text-head text-overflow full_row">
						<span className="text-head-info text-overflow">
							{marker.name ? marker.name : ""} - {marker.brand ? marker.brand : ""}
						</span>
						<span className="text-head-city">{marker.brand ? marker.brand : ""}</span>
					</div>
					<div className="text-description text-overflow full_row">
						<ul className="highlight_tags">
							{marker.price ? `Priced at $${marker.price}` : "Free Test Drive"}
						</ul>
					</div>
				</div>
			</a>
		);
	}

	render() {
		return (
			<ReactiveBase
				app="car-store"
				credentials="cf7QByt5e:d2d60548-82a9-43cc-8b40-93cbbe75c34c"
			>
				<div className="row">
					<div className="col s6 col-xs-6">
						<SingleRange
							componentId="PriceSensor"
							appbaseField={this.props.mapping.price}
							title="SingleRange"
							data={
							[{ start: 0, end: 100, label: "Cheap" },
								{ start: 101, end: 200, label: "Moderate" },
								{ start: 201, end: 500, label: "Pricey" },
								{ start: 501, end: 1000, label: "First Date" }]
							}
							{...this.props}
						/>
					</div>

					<div className="col s6 col-xs-6">
						<ReactiveList
							componentId="SearchResult"
							appbaseField={this.props.mapping.name}
							title="Results"
							sortOptions={[
								{
									label: "Lowest Price First",
									appbaseField: "price",
									sortBy: "asc"
								},
								{
									label: "Highest Price First",
									appbaseField: "price",
									sortBy: "desc"
								},
								{
									label: "Most rated",
									appbaseField: "rating",
									sortBy: "desc"
								}
							]}
							from={0}
							size={20}
							onData={this.onData}
							react={{
								and: "PriceSensor"
							}}
						/>
					</div>
				</div>
			</ReactiveBase>
		);
	}
}

SingleRangeDefault.defaultProps = {
	mapping: {
		price: "price",
		name: "name"
	}
};
