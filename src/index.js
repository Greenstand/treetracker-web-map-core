import _ from "lodash";
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-utfgrid/L.UTFGrid';
import 'leaflet.gridlayer.googlemutant';
import Map from "./Map.js";

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(['Hello', 'webpack serve!'], ' ');

  return element;
}

const element = component();

document.body.appendChild(element);

const mapContainer = document.createElement('div');
mapContainer.innerHTML = "<div id='map' style='height: 600px;width: 800px;' ></div>";
document.body.appendChild(mapContainer);

window.onload = () => {
  const map = new Map({
    onLoad: () => console.log("onload"),
    onClickTree: () => console.log("onClickTree"),
    onFindNearestAt: () => console.log("onFindNearstAt"),
    onError: () => console.log("onError"),
    filters: {},
  });
  map.mount(document.getElementById("map"));
};
