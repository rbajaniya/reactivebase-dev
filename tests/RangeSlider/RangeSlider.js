import React from 'react';
import { ReactiveBase, RangeSlider, ReactiveList } from '../../app/app.js';
import {config} from './config';
import { mount } from 'enzyme';

function testComponent(cb) {
	const onData = function(res, err) {
		cb(res, err);
	}
	const component = mount(
		<ReactiveBase
				app={config.ReactiveBase.app}
				credentials={`${config.ReactiveBase.username}:${config.ReactiveBase.password}`}

				type={config.ReactiveBase.type}
			>
			<div className="row">
				<div className="col s6 col-xs-6">
					<RangeSlider
						componentId="CitySensor"
						appbaseField={config.mapping.guests}
						title="RangeSlider"
						defaultSelected={config.RangeSlider.defaultSelected}
						range={config.RangeSlider.data}
						size={100}
					/>
				</div>
				<div className="col s6 col-xs-6">
					<ReactiveList
						componentId="SearchResult"
						appbaseField={config.mapping.topic}
						title="Results"
						sortBy={config.ReactiveList.sortBy}
						from={config.ReactiveList.from}
						size={config.ReactiveList.size}
						onData={onData}
						requestOnScroll={true}
						react={{
							'and': ["CitySensor"]
						}}
					/>
				</div>
			</div>
		</ReactiveBase>
	);
}
export var RangeSliderTest = function() {
	return new Promise((resolve, reject) => {
		testComponent(function(res,err) {
			if (err) {
				reject(err);
			} else if (res) {
				resolve(res);
			}
		});
	});
}
