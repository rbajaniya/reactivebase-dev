import React from 'react';
import {ToggleButtonTest} from './ToggleButton';
import {expectedValues} from './config';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('ToggleButton test', () => {
	var response = null;
	
	beforeAll(() => {
		return ToggleButtonTest().then((res) => {
			response = res;
			return response;
		}).catch((err) => err);
	});

	test('Response should exists', ()=> {
		expect(response).toBeTruthy();
	})

	test('Query should match', () => {
		expect(response.appliedQuery).toMatchObject(expectedValues.appliedQuery);
	});

	test('result length', () => {
		expect(response.newData.length).toBe(expectedValues.resultLength);
	});

});
