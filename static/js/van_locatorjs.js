var geocoder = new google.maps.Geocoder();

function updateMarkerPosition(latLng) {
  document.getElementById('info').innerHTML = [
    latLng.lat(),
    latLng.lng()
  ].join(', ');
}

function initialize() {
  var latLng = new google.maps.LatLng(-37.814, 144.963);
  
  var map = new google.maps.Map(document.getElementById('mapCanvas'), {
    zoom: 14,
    center: latLng,
    mapId: '36c2b059eab420f4',
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    gestureHandling: "greedy",
    disableDefaultUI: true
  });

  var marker = new google.maps.Marker({
    position: latLng,
    title: 'now pos',
    map: map,
    draggable: true
  });

  if (navigator.geolocation) {
    //pan to user
    navigator.geolocation.getCurrentPosition(
    (position) => {
      const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      };
      map.setCenter(pos)
      marker.setPosition(pos)
    })
  }

  // Update current position info.
  updateMarkerPosition(latLng);

  // Add dragging event listener.
  google.maps.event.addListener(marker, 'drag', function() {
    updateMarkerPosition(marker.getPosition());
  });

  google.maps.event.addListener(marker, 'dragend', function() {
    updateMarkerPosition(marker.getPosition());
  });
}

// Onload handler to fire off the app.
google.maps.event.addDomListener(window, 'load', initialize);