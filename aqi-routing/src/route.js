import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MapStyles.css'; // Import the custom CSS file

const routeData = {
  "type": "FeatureCollection",
  "name": "roads",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
    { "type": "Feature", "properties": { "id": 1 }, "geometry": { "type": "MultiLineString", "coordinates": [ [  [78.347453, 17.446521 ],[ 78.351330682387484, 17.445888725925958 ], [ 78.351200529628514, 17.445738419896234 ], [ 78.351097777450391, 17.445784165222754 ], [ 78.351015575707876, 17.445784165222754 ], [ 78.350995025272269, 17.445718814752791 ],  [ 78.348986, 17.447418 ],[ 78.348611174739673, 17.447751203404426 ], [ 78.346309525949579, 17.445372456870953 ], [ 78.346282125368759, 17.44545087758107 ], [ 78.346158822755001, 17.445424737348102 ], [ 78.346097171448122, 17.445365921810254 ], [ 78.346062920722076, 17.445274430935882 ], [ 78.346131422174167, 17.445196010149878 ], [ 78.346138272319351, 17.445182940015588 ], [ 78.346069770867288, 17.445130659469093 ] ] ] } },
    { "type": "Feature", "properties": { "id": 2 }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 78.351392333694335, 17.445869120798683 ], [ 78.35120737977374, 17.445712279704516 ], [ 78.35120737977374, 17.445620789003936 ], [ 78.351132028176409, 17.445555438475409 ], [ 78.351008725562679, 17.445529298257448 ], [ 78.350953924400997, 17.445555438475409 ], [ 78.350686768737873, 17.445150264675789 ], [ 78.349816800296395, 17.444333379277655 ],  [ 78.348644, 17.445351 ],[ 78.347282246569208, 17.446398458495395 ], [ 78.346309525949579, 17.445352851688153 ], [ 78.34636432711126, 17.445274430935882 ], [ 78.34636432711126, 17.44520908028321 ], [ 78.34626842507835, 17.445202545216652 ], [ 78.346158822755001, 17.445156799744215 ], [ 78.346138272319351, 17.44520908028321 ], [ 78.346056070576878, 17.445117589330131 ] ] ] } },
    { "type": "Feature", "properties": { "id": 4 }, "geometry": { "type": "MultiLineString", "coordinates": [ [[ 78.351351232823106, 17.445810305404176 ], [ 78.351200529628514, 17.445699209607241 ], [ 78.351200529628514, 17.445588113742609 ], [ 78.351070376869558, 17.445568508582994 ], [ 78.350974474836647, 17.445548903421276 ], [ 78.350337411332234, 17.444823510955715 ],[ 78.349582159474,17.44554886380476], [ 78.348755027789039, 17.446123987288953 ], [ 78.348330318786125, 17.446326573219348 ], [ 78.347734356152984, 17.4468428395726 ], [ 78.346323226240017, 17.44534631662675 ],[78.347453,  17.446521] ,[ 78.346343776675639, 17.445235220547087 ], [ 78.346275275223533, 17.445182940015588 ], [ 78.346172523045411, 17.445163334812403 ], [ 78.346117721883743, 17.445196010149878 ], [78.346282125368759,17.44545087758107] ] ] } },
    { "type": "Feature", "properties": { "id": 6 }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 78.351371783258728, 17.445947541295176 ], [ 78.351159428757242, 17.445790700268475 ], [ 78.351036126143512, 17.445784165222754 ], [ 78.350981324981831, 17.445744954943585 ], [ 78.349487993326349, 17.446953934672649 ], [ 78.348789278515099, 17.446110917221191 ], [ 78.347741206298181, 17.446823234547917 ], [78.347453, 17.446521 ],[ 78.346295825659155, 17.445365921810254 ], [ 78.34637802740167, 17.445215615349532 ], [ 78.346323226240017, 17.445196010149878 ], [ 78.346138272319351, 17.445156799744215 ], [ 78.346138272319351, 17.44516986988037 ] ] ] } }
  ]
};

// Node data with AQI values
const nodeData = [
  { id: 1, location: 'Main Gate', coordinates: [17.445888725925958, 78.351330682387484], aqi: 10 },
  { id: 2, location: 'OBH', coordinates: [17.44545087758107, 78.346282125368759], aqi: 20 },
  { id: 3, location: 'Nilgiri', coordinates: [17.447418, 78.348986], aqi: 5 },
  { id: 4, location: 'Vindhya', coordinates: [17.445351, 78.348644], aqi: 50 },
  { id: 5, location: 'Vindhya A4', coordinates: [17.44554886380476, 78.349582159474], aqi: 5 },
  { id: 6, location: 'sahana', coordinates: [  17.446521, 78.347453], aqi: 20 },

];

const MyMapComponent = () => {
  const [showCircles, setShowCircles] = useState(false);
  const customIcon = new L.Icon({
    iconUrl: '/th.jpg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

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

  const routeAQIs = useMemo(() => {
    return routeData.features.map(route => ({
      id: route.properties.id,
      aqi: calculateRouteAQI(route),
    }));
  }, []);

  const bestRoute = routeAQIs.reduce((minRoute, route) => route.aqi < minRoute.aqi ? route : minRoute, routeAQIs[0]);

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar">
        <h2>AQI Route Map</h2>
      </nav>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer center={[17.445888725925958, 78.351330682387484]} zoom={16} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Display only the route with the lowest AQI */}
          <GeoJSON
            key={bestRoute.id}
            data={routeData.features.find(route => route.properties.id === bestRoute.id)}
            style={{
              color: 'green',
              weight: 5,
              opacity: 0.7
            }}
          />
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

        {/* AQI Legend */}
        <div className="aqi-legend">
          <h3>Route AQI Information</h3>
          <ul>
            {routeAQIs.map(route => (
              <li key={route.id}>Route {route.id}: {route.aqi} AQI</li>
            ))}
          </ul>
          <button onClick={() => setShowCircles(!showCircles)}>
            {showCircles ? 'Hide Range' : 'Show Range'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyMapComponent;