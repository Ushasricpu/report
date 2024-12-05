import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MapStyles.css'; // Import the custom CSS file
import { FaSearch } from 'react-icons/fa';
import Component from './Component_data';  // corrected import path
import Route from './Route';      
import MapComponent from './MapComponent'; 

const routeData = {
  "type": "FeatureCollection",
  "name": "roads",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
    { "type": "Feature", "properties": { "id": 8, "Distance": 437, "Time": "1 min 39 sec" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 78.348953682000214, 17.44596714641408 ], [ 78.348768728079591, 17.446110917221226 ], [ 78.348364569512285, 17.446306968139194 ],[78.348230,17.446501], [ 78.347741206298281, 17.446810164530326 ], [ 78.346364327111374, 17.445418202289328 ], [ 78.346145122464705, 17.445398597111446 ], [ 78.346069770867388, 17.445274430935921 ], [ 78.346110871738659, 17.445189475082888 ], [ 78.346165672900341, 17.445137194538262 ] ] ] } },
    { "type": "Feature", "properties": { "id": 9, "Distance": 442, "Time": "1 min 40 sec" }, "geometry": { "type": "MultiLineString", "coordinates": [ [[ 78.348933131564607, 17.44598675153081 ], [ 78.34879612866041, 17.446104382186995 ],[78.348556,17.445842],  [ 78.348344019076634, 17.445568508583047 ], [ 78.347302797004943, 17.446365783373473 ], [ 78.346357476966148, 17.445392062051678 ], [ 78.346199923626358, 17.445424737348148 ], [ 78.346097171448235, 17.445359386749363 ], [ 78.346151972609903, 17.445196010149903 ] ] ] } },
    { "type": "Feature", "properties": { "id": 10, "Distance": 677, "Time": " 2 min 32 sec" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [78.348970,17.446335],[78.348986,17.447418],[ 78.349008483161882, 17.44596061137468 ], [ 78.348768728079591, 17.446091312117836 ], [ 78.349590745504599, 17.446993144691838 ], [ 78.348624875030211, 17.447731598477457 ], [ 78.346357476966148, 17.445405132170979 ], [ 78.346186223335948, 17.445392062051678 ], [ 78.346097171448235, 17.445307106253463 ], [ 78.346138272319493, 17.445182940015634 ] ] ] } }
     ]
};

const MyMapComponent = () => {
  const [nodeData, setNodeData] = useState([]);
  const [showCircles, setShowCircles] = useState(false);
  const [source, setSource] = useState('T-Hub');  // Default to 'Main Gate'
  const [destination, setDestination] = useState('OBH'); 
  const [routes, setRoutes] = useState([]);
  const [page, setPage] = useState('map');  // Track the current page (map, route, or component)

  const handleSearch = () => {
    if ((source === 'OBH' && destination === 'Main Gate') || (source === 'Main Gate' && destination === 'OBH')) {
      setRoutes(["Route 1", "Route 2", "Route 3", "Route 4"]);
      setPage('mapcomponent');  // Redirect to Route page
    } else if ((source === 'OBH' && destination === 'T-Hub') || (source === 'T-Hub' && destination === 'OBH')) {
      setRoutes([]);
      setPage('route');  // Redirect to Component page
    } else if ((source === 'Main Gate' && destination === 'T-Hub') || (source === 'T-Hub' && destination === 'Main Gate')) {
      setRoutes([]);
      setPage('component');  // Redirect to Component page
    }
  };

  const customIcon = new L.Icon({
    iconUrl: '/th.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Fetch node data from output.json
  useEffect(() => {
    fetch('/output.json')
      .then(response => response.json())
      .then(data => setNodeData(data))
      .catch(error => console.error('Error loading node data:', error));
  }, []);

  const calculateRouteAQI = (route) => {
    const routeCoords = route.geometry.coordinates[0];
    const tolerance = 0.0001;
    const isCloseEnough = (coord1, coord2) =>
      Math.abs(coord1[0] - coord2[1]) < tolerance && Math.abs(coord1[1] - coord2[0]) < tolerance;
    const matchingNodes = nodeData.filter(node =>
      routeCoords.some(coord => isCloseEnough(coord, node.coordinates))
    );

    const totalAQI = matchingNodes.reduce((sum, node) => sum + node.aqi, 0);
    return totalAQI;
  };

  // Memoized route AQIs to calculate only when nodeData changes
  const routeAQIs = useMemo(() => {
    if (nodeData.length === 0) return [];
    return routeData.features.map(route => ({
      id: route.properties.id,
      aqi: calculateRouteAQI(route),
    }));
  }, [nodeData]);

  const bestRoute = useMemo(() => {
    return routeAQIs.reduce((minRoute, route) => (route.aqi < minRoute.aqi ? route : minRoute), routeAQIs[0] || {});
  }, [routeAQIs]);

  const filteredNodes = useMemo(() => {
    return nodeData.filter(node =>
      (source ? node.location === source : true) &&
      (destination ? node.location === destination : true)
    );
  }, [nodeData, source, destination]);

  return (
    <div className="page">
     
    {page === 'map' && (
      <div className="container">
        {/* Left Panel with two iframes */}
        <div className="left-panel">
          <iframe 
            src="https://smartcitylivinglab.iiit.ac.in/grafana/d-solo/kyLuJXQ7z/summary-view?orgId=1&from=1730337505906&to=1731633505906&panelId=38" 
            width="100%" 
            height="200" 
            frameBorder="0"
          ></iframe>
          <iframe 
            src="https://smartcitylivinglab.iiit.ac.in/grafana/d-solo/kyLuJXQ7z/summary-view?orgId=1&from=1730337553851&to=1731633553851&panelId=31" 
            width="100%" 
            height="200" 
            frameBorder="0"
          ></iframe>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <MapContainer 
            center={[17.445888725925958, 78.351330682387484]} 
            zoom={16} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {bestRoute && bestRoute.id && (
              <GeoJSON
                key={bestRoute.id}
                data={routeData.features.find(route => route.properties.id === bestRoute.id)}
                style={{
                  color: 'blue',
                  weight: 5,
                  opacity: 0.7
                }}
                onEachFeature={(feature, layer) => {
                  layer.on('mouseover', () => {
                    layer.bindPopup(`
                      <strong>Route ${feature.properties.id}</strong><br />
                      Distance: ${feature.properties.Distance} <br />
                      Time: ${feature.properties.Time}
                    `).openPopup();
                  });
                  layer.on('mouseout', () => {
                    layer.closePopup();
                  });
                }}
              />
            )}
            {filteredNodes.map(node => (
              <Marker key={node.id} position={node.coordinates} icon={customIcon}>
                <Popup>
                  <strong>{node.id}</strong><br />
                  <strong>{node.location}</strong><br />
                  AQI: {node.aqi}
                </Popup>
              </Marker>
            ))}
            {nodeData.map(node => (
        <Marker key={node.id} position={node.coordinates} icon={customIcon}>
          <Popup>
            <strong>{node.location}</strong><br />
            AQI: {node.aqi}
          </Popup>
        </Marker>
      ))}
            {showCircles && nodeData.map(node => (
              <Circle
                key={node.id}
                center={node.coordinates}
                radius={50}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Right Panel with two iframes */}
        <div className="right-panel">
          <iframe 
            src="https://smartcitylivinglab.iiit.ac.in/grafana/d-solo/kyLuJXQ7z/summary-view?orgId=1&from=1730340914090&to=1731636914090&panelId=55"
            width="100%" 
            height="200" 
            frameBorder="0"
          ></iframe>
          <iframe 
            src="https://smartcitylivinglab.iiit.ac.in/grafana/d-solo/kyLuJXQ7z/summary-view?orgId=1&from=1730337580781&to=1731633580781&panelId=30" 
            width="100%" 
            height="200" 
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    )}
    {page === 'mapcomponent' && <MapComponent />}
    {page === 'route' && <Route />}
    {page === 'component' && <Component />}

    <div className="aqi-legend">
  {page === 'map' && (
    <>
      <h3>Select Location</h3>
      <div className="search-container">
        <div className="dropdown">
          <select onChange={(e) => setSource(e.target.value)} value={source}>
            <option value="OBH">OBH</option>
            <option value="Main Gate">Main Gate</option>
            <option value="T-Hub">T-Hub</option>
          </select>
        </div>
        <div className="dropdown">
          <select onChange={(e) => setDestination(e.target.value)} value={destination}>
            <option value="OBH">OBH</option>
            <option value="Main Gate">Main Gate</option>
            <option value="T-Hub">T-Hub</option>
          </select>
        </div>
        <button className="search-icon" onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>
      <h3>Route AQI Information</h3>
      <ul>
        {routeAQIs.map(route => (
          <li key={route.id}>Route {route.id}: {route.aqi} AQI</li>
        ))}
      </ul>
      <button onClick={() => setShowCircles(!showCircles)}>
        {showCircles ? 'Hide Range' : 'Show Range'}
      </button>
    </>
  )}

</div>

  </div>
  );
};

export default MyMapComponent;
