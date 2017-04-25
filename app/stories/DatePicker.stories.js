import React, { Component } from "react";
import { ReactiveBase, DatePicker, ReactiveList } from "../app";
import { ResponsiveStory } from "../middleware/helper";
import { Img } from "./Img";

const moment = require("moment");
require("./list.css");

export default class DatePickerDefault extends Component {
	constructor(props) {
		super(props);
		this.DEFAULT_IMAGE = "http://www.avidog.com/wp-content/uploads/2015/01/BellaHead082712_11-50x65.jpg";
	}

	componentDidMount() {
		ResponsiveStory();
	}

	onData(markerData) {
		const marker = markerData._source;
		return (
			<a
				className="full_row single-record single_record_for_clone"
				href={marker.event ? marker.event.event_url : ""}
				target="_blank"
				rel="noopener noreferrer"
				key={markerData._id}
			>
				<div className="img-container">
					<Img key={markerData._id} src={marker.member ? marker.member.photo : this.DEFAULT_IMAGE} />
				</div>
				<div className="text-container full_row">
					<div className="text-head text-overflow full_row">
						<span className="text-head-info text-overflow">
							{marker.member ? marker.member.member_name : ""} is going to {marker.event ? marker.event.event_name : ""}
						</span>
						<span className="text-head-city">
							{marker.group ? marker.group.group_city : ""} ({moment(marker.mtime).format("MM-DD")})
						</span>
					</div>
					<div className="text-description text-overflow full_row">
						<ul className="highlight_tags">
							{
								marker.group.group_topics.map(tag => (<li key={tag.topic_name}>{tag.topic_name}</li>))
							}
						</ul>
					</div>
				</div>
			</a>
		);
	}

	render() {
		return (
			<ReactiveBase
				app="reactivemap-demo"
				credentials="IvfKUzoER:8330c43a-e453-4d43-9a66-a4986b3714c6"
				type="meetup"
			>
				<div className="row">
					<div className="col s6 col-xs-6">
						<DatePicker
							componentId="DateSensor"
							appbaseField="mtime"
							title="title"
							{...this.props}
						/>
					</div>

					<div className="col s6 col-xs-6">
						<ReactiveList
							componentId="SearchResult"
							appbaseField="mtime"
							title="Results"
							from={0}
							size={20}
							onData={this.onData}
							react={{
								and: "DateSensor"
							}}
						/>
					</div>
				</div>
			</ReactiveBase>
		);
	}
}
