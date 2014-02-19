$(function() {

  var map, 
      values = {}, 
      geojson, 
      countries,
      year = 2012;

  var colors = ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)'];

  initMap();

  $.when(
    $.getJSON('data/countries_110m.geojson'),
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT country, year, type, value FROM turi_values WHERE indicator='test'")  
  ).then(loaded);

  function loaded(geojson, data) {
    if (geojson[1] = 'success') {
      createMap(geojson[0]);
      countries = parseFeatures(geojson[0].features);
    }
    if (data[1] = 'success') {
      var values = parseData(data[0]);
      styleMap(values);
      createTable(countries, values);
    }
  }

  function initMap() {
    // Sphere Mollweide: http://spatialreference.org/ref/esri/53009/
    var crs = new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
      resolutions: [50000, 25000, 12500, 6250, 3125] 
    });

    map = L.map('map', {
      crs: crs,
      maxZoom: 3,
      scrollWheelZoom: false
    }).setView([0, 0], 0);

    map.attributionControl.setPrefix('');

    L.graticule({
      sphere: true,
      style: {
        opacity: 0,
        fillColor: '#ddf4fe',
        fillOpacity: 1,
        clickable: false
      }      
    }).addTo(map);

    L.graticule({
      style: {
        color: '#fff',
        weight: 1,
        opacity: 0.5,
        clickable: false
      }        
    }).addTo(map);
  }

  function createMap(countries) {
    geojson = L.geoJson(countries, {
      style: function (feature) {
        return {
          color: '#fff',
          opacity: 1,
          weight: 1,
          fillColor: '#ddd',
          fillOpacity: 1,
          clickable: true
        };
      }
    }).addTo(map);
  }

  function styleMap(values) {
    geojson.eachLayer(function (layer) {
        var feature = layer.feature;
        if (values[feature.id] && values[feature.id][year]) {
          var value = values[feature.id][year].both;  
          layer.setStyle({
            fillColor: colors[Math.floor(value/10)]
          });
          layer.bindLabel(feature.properties.name + ': ' + value, {direction: 'auto'}); 
          layer.on('click', onMapClick); 
        } else {
          layer.setStyle({
            fillColor: '#ddd'}
          ); 
          layer.unbindLabel(); 
          layer.off('click', onMapClick);
        }
    });

    createLegend(colors);
  }

  function parseData(data) {
    for (var i = 0; i < data.rows.length; i++) { 
    	var item = data.rows[i];
    	if (!values[item.country]) values[item.country] = {}; 
      if (!values[item.country][item.year]) values[item.country][item.year] = {}; 
    	values[item.country][item.year][item.type] = item.value;
    }
    return values;
  }

  function parseFeatures(features) {
    var countries = {};
    for (var i = 0; i < features.length; i++) {
      countries[features[i].id] = features[i].properties;     
    }
    return countries;
  }

  function createLegend(colors) {
    var legend = L.control({
      position: 'bottomright'
    });  
    legend.onAdd = function(map){
      var div = L.DomUtil.create('div', 'leaflet-control-legend');
      var html = '<span>Worse</span>';
      for (var i = 0; i < colors.length; i++) {
        html += '<i class="leaflet-control-legend-color" style="background:' + colors[i] + '"></i>';
      }
      html += '<span>Better</span>';      
      div.innerHTML = html;      
      return div;
    };
    legend.addTo(map);
  }

  function onMapClick(evt) {
    if (evt.target.feature) showCountry(evt.target.feature.id);
  }

  function showCountry (code) {
    var country = countries[code];
    $('#detail').html('<h3>' + country.name + '</h3><p>Show country data</p><div id="placeholder" class="demo-placeholder"></div><br/><button type="button" class="btn btn-default">Country profile</button>');
    createGraph(values[code]);
  }

  function createGraph (values) {
    var data = [];
    for (year in values) {
      data.push([year, values[year].both]);
    }
    $.plot("#placeholder", [data], {
      series: {
        lines: { show: true },
        points: { show: true }
      },
      xaxis: {
        tickDecimals: 0
      },
      yaxis: {
        tickDecimals: 0
      }
    });    
  }

  function createTable (countries, values) {
    var html = '',
        year = 2012;

    for (code in values) {  
      var name = 'Country';
      if (countries[code]) name = countries[code].name;
      var value = values[code][year].both;
      html += '<tr id="' + code + '"><td>' + name + '</td><td class="text-right">' + value + '</td></tr>'
    }

    $('.table tbody').append(html);

    new Tablesort(document.getElementById('table'));

    // Trigger click to sort table
    $('.table thead tr th:last-child').trigger('click');

    $('.table tbody tr').click(function() {
      if (this.id) showCountry(this.id);
    });

  }

  $('.navbar-nav .toggle').click(function (evt) {
    evt.preventDefault(); 
    menuChange(this.id);
  });

  function menuChange (id) {
    $('.navbar-nav li').removeClass('active');
    $('#'+ id).addClass('active');
    $('.toggle-pane').hide();
    $('#'+ id +'-pane').show();    
  }

});
