import React from 'react'
import { taxi } from './assets/taxi'
import Store from './stores/Store'
import styled from 'styled-components'
import './App.css'

//Third Party
import { observer } from 'mobx-react'
import lifecycle from 'react-pure-lifecycle'
import ReactMapboxGl, { Layer, Feature, Popup} from "react-mapbox-gl"

const StyledPopup = styled.div`
  background: white;
  color: #3f618c;
  font-weight: 400;
  padding: 5px;
  border-radius: 2px;
`;

const Mapbox = ReactMapboxGl({
  minZoom: 8,
  maxZoom: 15,
  accessToken: "pk.eyJ1IjoiZGVhZG1hbjE2IiwiYSI6ImNqdzFla2ZvZTBrenU0OHFxNWhnNGZpYWwifQ.eugwO7VLrbl0M6E4isr9ug"
});

const flyToOptions = {
  speed: 0.8
};

// Define layout to use in Layer component
const layoutLayer = { 
  'icon-allow-overlap': true,
  'icon-image': 'londonTaxi' 
}

// Create an image for the Layer
const image = new Image();
image.src = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(taxi);
const Images = ['londonTaxi', image];

// Action events
const _onHoverAction = (event) => {
  const map = event.map;
  map.getCanvas().style.cursor = 'pointer'
}
const _onLeaveAction = (event) => {
  const map = event.map;
  map.getCanvas().style.cursor = ''
  Store.ob.selected = undefined
}
const _onClickAction = (event, obj) => {
  Store.ob.zoom = 14;
  Store.ob.selected = obj
}
const _onChangeAction = (e) =>{
  Store.ob.sliderVal = e.target.value
}
const _onMouseUpAction = () =>{
  const { actions } = Store
  actions.getTaxi()
}

const App = observer((props) => {
  
  const _renderDrivers = () =>{
    const { drivers } = Store.ob.taxiList
    if(drivers){
     return Object.keys(drivers).map((key, index) => (
        <Feature
          key={key}
          onMouseEnter={(e) => _onHoverAction(e)}
          onMouseLeave={(e) => _onLeaveAction(e)}
          onClick={(e) => _onClickAction(e, drivers[key])}
          coordinates={[drivers[key].location.longitude, drivers[key].location.latitude]}
        />
      ))
    }   
  } 
  
  let jsxSlider = 
        <div className='map-overlay top'>
          <div className='map-overlay-inner'>
            <h3>Show <label id='count'>{Store.ob.sliderVal}</label> available Taxi Drivers</h3>
            <p>{ Store.ob.taxiList.pickup_eta ? `Pickup ETA in ` + Store.ob.taxiList.pickup_eta + ` minute(s)` : null }</p>
            <input 
                id='slider' 
                type='range' 
                min='0' 
                max='50' 
                step='1' 
                value={Store.ob.sliderVal} 
                onChange={(e) => _onChangeAction(e)}
                onMouseUp={(e) => _onMouseUpAction(e)}
                />
          </div>
        </div>   
  
  return (
    <div className="App">
          <Mapbox
              style="mapbox://styles/mapbox/streets-v9"
              containerStyle={{
                height: "100vh",
                width: "100vw"
              }}
              center={[-0.0964509, 51.5049375]}
              zoom={[Store.ob.zoom]}
              flyToOptions={flyToOptions}
              >
              <Layer
                  type="symbol"
                  id="marker"
                  layout={layoutLayer} 
                  images={Images}
                >
                { _renderDrivers() }
              </Layer>
              {Store.ob.selected && (
                <Popup 
                  key={Store.ob.selected.driver_id} 
                  coordinates={[Store.ob.selected.location.longitude,Store.ob.selected.location.latitude]}
                  offset={{ 'bottom-left': [12, -38],  'bottom': [0, -38], 'bottom-right': [-12, -38] }}>
                  <StyledPopup>
                    <div>{Store.ob.selected.driver_id}</div>
                  </StyledPopup>
                </Popup>
              )}
            </Mapbox>   
            { jsxSlider }
    </div>
  );
})

const componentDidMount = (props) =>{
  const { actions } = Store
  actions.getTaxi()
}
const methods = {
  componentDidMount
};

export default lifecycle(methods)(App);
