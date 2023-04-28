import React from 'react';
import  { shallow, mount } from 'enzyme';
import App from '../App';
import EventList from '../EventList';
import CitySearch from '../CitySearch';
import { mockData } from '../mock-data';
import { extractLocations, getEvents } from '../api';
import NumberOfEvents from '../NumberOfEvents';

describe('<App /> component', () => { // shallow scope (unit testing)
    let AppWrapper;
    beforeAll(() => {
        AppWrapper = shallow(<App />);
    });

    test('render list of events', () => {
        expect(AppWrapper.find(EventList)).toHaveLength(1);
    });
    
    test('render CitySearch', () => {
        expect(AppWrapper.find(CitySearch)).toHaveLength(1);
      });  
}); 

describe('<App /> integration', () => { //full scope (integration testing)
    let AppWrapper;
    beforeAll(() => {
      AppWrapper = mount(<App />);
    });
    afterAll(() => {
      if (AppWrapper && AppWrapper.length > 0) {
        AppWrapper.unmount();
      }
    });
    

    test('App passes "events" state as a prop to EventList', () => {
        const AppWrapper = mount(<App />);
        const AppEventsState = AppWrapper.state('events');
        expect(AppEventsState).not.toEqual(undefined);
        expect(AppWrapper.find(EventList).props().events).toEqual(AppEventsState);
        AppWrapper.unmount();
      });
    
      test('App passes "locations" state as a prop to CitySearch', () => {
        const AppWrapper = mount(<App />);
        const AppLocationsState = AppWrapper.state('locations');
        expect(AppLocationsState).not.toEqual(undefined);
        expect(AppWrapper.find(CitySearch).props().locations).toEqual(AppLocationsState);
        AppWrapper.unmount();
      });
      
      test("get list of events matching the city selected by the user", async () => {
        const CitySearchWrapper = AppWrapper.find(CitySearch);
        const locations = extractLocations(mockData);
        CitySearchWrapper.setState({ suggestions: locations });
        const suggestions = CitySearchWrapper.state("suggestions");
        const selectedIndex = Math.floor(Math.random() * suggestions.length);
        const selectedCity = suggestions[selectedIndex];
        await CitySearchWrapper.instance().handleItemClicked(selectedCity);
        const allEvents = await getEvents();
        const eventsToShow = allEvents.filter(
          (event) => event.location === selectedCity
        );
        const shownEvents = eventsToShow.slice(0, 32);
        expect(AppWrapper.state("events")).toEqual(shownEvents);
      });
      
      test('get list of all events when user selects "See all cities"', async () => { 
        const suggestionItems = AppWrapper.find(CitySearch).find(".suggestions li");
        await suggestionItems.at(suggestionItems.length - 1).simulate("click");
        const allEvents = await getEvents();
        const shownEvents = allEvents.slice(0, 32);
        expect(AppWrapper.state("events")).toEqual(shownEvents); // This line is throwing error
      });
      
      test("events state changes number of events changes", () => {
        const AppWrapper = mount(<App />);
        const eventCount = AppWrapper.state("eventCount");
        expect(eventCount).toEqual(AppWrapper.find(NumberOfEvents).props().query);
        AppWrapper.unmount();
      });
    
      test("get list of events matching the number of events selected by the user", async () => {
        const NumberOfEventsWrapper = AppWrapper.find(NumberOfEvents);
        const selectedNumber = Math.floor(Math.random() * 32);
        const event = { target: { value: selectedNumber } };
        await NumberOfEventsWrapper.instance().handleInputChanged(event);
        expect(AppWrapper.state("eventCount")).toEqual(selectedNumber);
        expect(AppWrapper.state("events").length).toBe(selectedNumber);
      });

});      