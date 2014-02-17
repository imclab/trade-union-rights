

$.getJSON('data/countries_110m.geojson', function(countries) {
  createMap(countries);
});


function createMap(countries) {

  // Sphere Mollweide: http://spatialreference.org/ref/esri/53009/
  var crs = new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
    resolutions: [50000, 25000, 12500, 6250, 3125] 
  });

  var map = L.map('map', {
    crs: crs,
    maxZoom: 4,
    scrollWheelZoom: false
  }).setView([0, 0], 0);

  map.attributionControl.setPrefix('');

  L.graticule({
    sphere: true,
    style: {
      opacity: 0,
      fillColor: '#ddf4fe',
      fillOpacity: 1
    }      
  }).addTo(map);

  L.graticule({
    style: {
      color: '#fff',
      weight: 1,
      opacity: 0.5
    }        
  }).addTo(map);

  L.geoJson(countries, {
    style: function (feature) {
      return {
        color: '#fff',
        weight: 2,
        fillColor: 'red',
        fillOpacity: 1
      };
    },
    onEachFeature: function (feature, layer) {
      layer.bindLabel(feature.properties.name + ' ' + feature.id, {direction: 'auto'});
      //layer.on('click', onMapClick);
    }
  }).addTo(map);

}



