$(function() {

  var data = {
    years: [2012, 2009, 2005, 2000],
    year: 2012,
    indicators: {},
    indicator: '1',
    types: {
      total: 'Total',
      dejure: 'In law',
      defacto: 'In practice'
    },
    type: 'total',
    countries: {},
    country: null,
    values: {},
    criteria: null,
    criterion: null,
    colors: ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)']
  };
  
  var map, geojson;

  initMap();

  $.when(
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT id, name FROM turi_indicator"),      
    $.getJSON('data/countries_110m.geojson'),
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT indicator, country, year, type, value FROM turi_values")  
  ).then(parseData);

  function parseData(indicators, geojson, values) {
    if (indicators[1] = 'success') {
      indicators = indicators[0].rows;
      for (var i = 0; i < indicators.length; i++) { 
        var indicator = indicators[i];
        data.indicators[indicator.id] = indicator;
        data.values[indicator.id] = {};
      }
    }

    if (geojson[1] = 'success') {
      var features = geojson[0].features;
      for (var i = 0; i < features.length; i++) {
        var feature = features[i]; 
        data.countries[feature.id] = feature.properties;     
      }
      drawCountries(geojson[0]);
    }

    if (values[1] = 'success') {
      values = values[0].rows;
      for (var i = 0; i < values.length; i++) { 
        var value = values[i];
      
        if (!data.values[value.indicator][value.country]) data.values[value.indicator][value.country] = {}; 
        if (!data.values[value.indicator][value.country][value.year]) data.values[value.indicator][value.country][value.year] = {}; 
        data.values[value.indicator][value.country][value.year][value.type] = value.value;
      }
      styleMap(data.values[data.indicator], data.year);
      createTable(data.countries, data.values[data.indicator]);
    }
  }

  function initMap() {
    // Sphere Mollweide: http://spatialreference.org/ref/esri/53009/
    var crs = new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
      resolutions: [40000, 20000, 10000, 5000, 2500] 
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

    createLayerSwitcher();
  }

  function drawCountries(countries) {
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
    createLegend(data.colors);
  }

  function styleMap(values, year) {
    geojson.eachLayer(function (layer) {
      var feature = layer.feature;
      if (values[feature.id] && values[feature.id][year] && values[feature.id][year][data.type]) {
        var value = values[feature.id][year][data.type];  
        layer.setStyle({ fillColor: data.colors[Math.floor(value/10)] });
        layer.bindLabel(feature.properties.name + ': ' + value, {direction: 'auto'}); 
        layer.on('click', onMapClick); 
      } else {
        layer.setStyle({ fillColor: '#ddd'} ); 
        layer.unbindLabel(); 
        layer.off('click', onMapClick);
      }
    });
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
    if (evt.target.feature) {
      data.country = evt.target.feature.id;
      showCountry(data.country);
    }
  }

  function showCountry (code) {
    var country = data.countries[code],
        year = data.year;

    $('#indicator').hide();

    var html = '<button style="float: right" type="button" id="profile-button" class="btn btn-warning">Country profile</button>';
    html += '<h4>' + country.name + '</h4><p>' + data.indicators[data.indicator].name +'</p>';
    html += '<div id="country-chart"></div><br/>';

    html += '<table id="country-table" class="table table-hover table-condensed">';
    html += '<thead><tr><th>Indicator</th><th class="text-right">' + year + '</th><th class="text-right">Trend</th></tr></thead><tbody>';

    for (id in data.indicators) {
      var indicator = data.indicators[id],
          style = 'default';

      html += '<tr class="' + ((id == data.indicator && data.type == 'total') ? 'warning' : 'default') + '"><td>' + indicator.name + '</td><td class="text-right">' + getValue(id, code, year, 'total') + '</td><td class="text-center">' + getTrend(id, code, year, 'total') + '</span></td></tr>';
      if (id == data.indicator) {
        html += '<tr class="' + ((data.type == 'dejure') ? 'warning' : 'default') + '"><td style="padding-left: 20px">In law</td><td class="text-right">' + getValue(id, code, year, 'dejure') + '</td><td class="text-center">' + getTrend(id, code, year, 'dejure') + '</td></tr>'
        html += '<tr class="' + ((data.type == 'defacto') ? 'warning' : 'default') + '"><td style="padding-left: 20px">In practice</td><td class="text-right">' + getValue(id, code, year, 'defacto') + '</td><td class="text-center">' + getTrend(id, code, year, 'defacto') + '</td></tr>'
      }
    }

    html +='</tbody></table>';

    $('#country').html(html).show();
    createGraph(data.values[data.indicator][code]);
    $('#profile-button').click(function (evt) {
      showProfile(code);
    });
  }

  function getValue (indicator, country, year, type) {
    var values = data.values[indicator];
    if (values[country] && values[country][year] && values[country][year][type]) {
      return values[country][year][type];
    } else {
      return 'No data';
    }
  }

  function getTrend (indicator, country, year, type) {
    var prevYear = data.years[data.years.indexOf(year) + 1];
    if (prevYear) {
      var lastValue = getValue(indicator, country, year, type),
          prevValue = getValue(indicator, country, prevYear, type)
      if (lastValue !== 'No data' && prevValue !== 'No data') {
        if (lastValue > prevValue) {
          return '<span class="glyphicon glyphicon-arrow-up"></span>';
        } else if (lastValue < prevValue) {
           return '<span class="glyphicon glyphicon-arrow-down"></span>';         
        }
      }
    }
    return '';
  }

  function createGraph (values) {
    var series = [],
        points = {};

    for (year in values) {
      series.push([year, values[year].total]);
      points[year] = series.length - 1;
    }
    var chart = $.plot("#country-chart", [series], {
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
    if (points[data.year] !== undefined) {
      chart.highlight(0, points[data.year]);
    }
  }

  function createTable (countries, values) {
    var html = '',
        year = 2012;

    for (code in values) {  
      var name = 'Country';
      if (countries[code]) name = countries[code].name;
      var value = values[code][year].total;
      html += '<tr id="' + code + '"><td>' + name + '</td><td></td><td></td><td class="text-right">' + value + '</td></tr>'
    }

    $('#ranking tbody').append(html);

    new Tablesort(document.getElementById('ranking'));

    // Trigger click to sort table
    $('#ranking thead tr th:last-child').trigger('click');

    $('#ranking tbody tr').click(function() {
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

  function showMap () {

  }

  function showRanking () {

  }

  function showProfile(code) {
    menuChange('country-nav');
    $('#country').hide();
    $('#indicator').show();

    var country = data.countries[code];
    $('#profile').html('<h3>' + country.name + '</h3>');

    if (data.criteria) {
      createCriteriaTable(data.indicators);
    } else {
      $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT id, indicator, type, name FROM turi_criteria ORDER BY indicator, id", function(criteria) {
        data.criteria = {};

        for (var i = 0; i < criteria.rows.length; i++) {   
          var criterion = criteria.rows[i],
              indicator = data.indicators[criterion.indicator];

          data.criteria[criterion.id] = criterion;
          if (!indicator[criterion.type]) indicator[criterion.type] = {};
          indicator[criterion.type][criterion.id] = criterion; 
        }   
        createCriteriaTable(data.indicators);     
      });  
    } 
  }

  function createCriteriaTable (indicators) {
    html = '';

    for (id in indicators) {
      var indicator = indicators[id];
      html += '<tr id="1" class="warning"><td>' + indicator.name + '</td><td class="text-right"></td></tr>';
      html += '<tr id="1dj"><td style="padding-left:20px">In law</td><td class="text-right"></td></tr>';

      for (id in indicator.dejure) {
        var criterion = indicator.dejure[id];
        html += '<tr id="1" class="criterion"><td style="padding-left:40px">' + id + '. ' + criterion.name + '</td><td class="text-right" style="font-size:14;font-weight:bold;">' + ((Math.random() < 0.5) ? '<span class="glyphicon glyphicon glyphicon-ok-sign"></span>' : '') + '</td></tr>';
      }

      html += '<tr id="1df"><td style="padding-left:20px">In practice</td><td class="text-right"></td></tr>';      

      for (id in indicator.defacto) {
        var criterion = indicator.defacto[id];
        html += '<tr id="1" class="criterion"><td style="padding-left:40px">' + id + '. ' + criterion.name + '</td><td class="text-right" style="font-size:14;font-weight:bold;">' + ((Math.random() < 0.5) ? '<span class="glyphicon glyphicon glyphicon-ok-sign"></span>' : '') + '</td></tr>';
      }
    }

    $('#criteria-table tbody').append(html);
  }

  function createLayerSwitcher () {
    var years = [2012, 2009, 2005, 2000],
        control = $('#indicator-control');

    var html = '<div class="btn-group">';
    html += '<div class="btn-group btn-group-sm"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Trade union rights<span class="caret"></span></button><ul class="dropdown-menu"><li><a href="#">Trade union rights</a></li><li><a href="#">Fundamental civil liberties</a></li><li><a href="#">Freedom of association rights</a></li><li><a href="#">Collective bargaining rights</a></li><li><a href="#">Right to strike</a></li></ul></div>';

    // Type
    html += '<div class="btn-group btn-group-sm dropdown-type"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i>Total</i><span class="caret"></span></button><ul class="dropdown-menu">';
    html += '<li id="total"><a href="#">Total</a></li>';
    html += '<li id="dejure"><a href="#">In law</a></li>';
    html += '<li id="defacto"><a href="#">In practice</a>';
    html += '</li></ul></div>';
      
    // Years
    html += '<div class="btn-group btn-group-sm dropdown-years"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-target="#"><i>' + years[0] + '</i><span class="caret"></span></button><ul class="dropdown-menu">';
    for (var i = 0; i < years.length; i++) {   
      html += '<li><a href="#">' + years[i] + '</a></li>';
    };
    html += '</ul></div>';

    html += '</div>';    
    control.append(html);

    $('.dropdown-type li', control).click(function (evt) {
      data.type = this.id;
      $('.dropdown-type i', control).text(data.types[data.type]);
      styleMap(data.values[data.indicator], data.year);
      if (data.country) {
        showCountry(data.country);
      }
    });

    $('.dropdown-years li a', control).click(function (evt) {
      data.year = parseInt($(this).text());
      $('.dropdown-years i', control).text(data.year);
      styleMap(data.values[data.indicator], data.year);
      if (data.country) {
        showCountry(data.country);
      }
    });

  }

});
