'use strict';

$(function() {
    var map = L.map('map', {
		center: [42.3463844, -71.1043828],
		zoom: 15
	});

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
		maxZoom: 18,
		attribution: '',
		id: 'mapbox.streets'
	}).addTo(map);

	var routes = new L.FeatureGroup();
	var markers = new L.FeatureGroup();

	$('.routeSearch').on('submit', function() {
        // Clear any current routes/incidents
		routes.clearLayers();
		markers.clearLayers();

		$.when(getLatLng($('.startingLocation').val())).then(function(s) {
            var start = {
                lat: s.results[0].geometry.location.lat,
                lng: s.results[0].geometry.location.lng
            };

			$.when(getLatLng($('.endingLocation').val())).then(function(e) {
                var end = {
                    lat: e.results[0].geometry.location.lat,
                    lng: e.results[0].geometry.location.lng
                };

                // Pan to start/end points
                map.fitBounds([start, end]);

				$.when(getRoutes(start, end)).then(function(routes) {
					var colors = ['red', 'blue', 'green', 'yellow', 'orange'];

					routes.forEach(function(route, index) {
						addRouteToMap(route, colors[index]);
					});
				});
			});
		});

		return false;
	});

	function getLatLng(address) {
		return $.ajax({
			url: 'https://maps.googleapis.com/maps/api/geocode/json',
			data: {
				'address': address
			},
			dataType: 'json',
			success: function(data) {
				return {
					lat: data.results[0].geometry.location.lat,
					lng: data.results[0].geometry.location.lat
				};
			}
		});
	}

	function getRoutes(s, e) {
        var start = s.lat + ',' + s.lng;
        var end = e.lat + ',' + e.lng;

		return $.ajax({
            // url: 'http://localhost:9000/data/ab1efcba698cefe56c000d2b384dcc6abde994088cd71687a381931626e066d2-data.json',
			url: 'http://server.ebrakke.com:3000',
			data: {
				'start': start,
				'end': end
			},
			dataType: 'json',
			success: function(data) {
				return data;
			}
		});
	}

	function addIncidentToMap(incident) {
		markers.addLayer(L.marker([incident.lat, incident.lng])).addTo(map);
	}

	function addRouteToMap(route, color) {
		var incidents = route.incidents;
		var steps = route.route.legs[0].steps;

		// Place each leg of the route
		var lines = [];
		steps.forEach(function(step) {
			var start = step['start_location'];
			var end = step['end_location'];

			lines.push([[start.lat, start.lng], [end.lat, end.lng]]);
		});
		routes.addLayer(L.multiPolyline(lines, {'color': color})).addTo(map);

		// Place a marker for each pothole
		incidents.forEach(function(incident) {
			addIncidentToMap(incident);
		});
	}
});
