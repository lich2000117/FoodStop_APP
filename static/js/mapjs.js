function mapDistance(lat1, long1, lat2, long2) {
    const LAT_LONG_SCALE_MELB = 1.3;
    lat1 *= LAT_LONG_SCALE_MELB;
    lat2 *= LAT_LONG_SCALE_MELB;
    return (lat1 - lat2) ** 2 + (long1 - long2) ** 2;
}

function mapAddButtonTitle(parentMap) {
    titleButton = document.createElement("button");
    titleButton.style.width = 'calc(10% + 40px)';
    titleButton.disable = true;
    titleButton.style.height = '40px';
    titleButton.style.fontSize = '15px';
    titleButton.textContent = "Vans near me";
    titleButton.classList.add("custom-map-control-button");
    titleButton.classList.add("btn-default");
    parentMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(titleButton);
}


function mapAddButton(parentMap, title, pos) {
    locationButton = document.createElement("button");
    locationButton.style.width = 'calc(10% + 40px)';
    locationButton.style.height = '40px';
    locationButton.textContent = "Pan to " + title;
    locationButton.classList.add("custom-map-control-button");
    locationButton.classList.add("btn-default");
    parentMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        parentMap.panTo(pos);
        parentMap.setZoom(20);
    });
}

function mapAddMarker(parentMap, lat, long) {
    const image ="/image/map/CarIcon.png"
    marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, long),
    map: parentMap,
    title: VANS[i][0],
    icon: image,
    url: VANS[i][3]
    });

    google.maps.event.addListener(marker, 'click', function() {
        window.location.href = this.url;
    });
}

// Initialize and add the map
function initMap() {
    const currentUrl = window.location.href

    fetch(currentUrl.slice(0, currentUrl.search("/home")) + "/vansLocation")
    .then(response => response.json())
    .then(vans => {
        // make a map
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center: new google.maps.LatLng(-37.80,144.97),
            mapId: '36c2b059eab420f4',
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            gestureHandling: "greedy",
            disableDefaultUI: true
        });

        //add markers
        var marker, i;
        for (i = 0; i < vans.length; i++) {
            const image ="/image/map/CarIcon.png"
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(vans[i].lat), parseFloat(vans[i].long)),
            map: map,
            title: vans[i].name,
            icon: image,
            url: '/customer/' + vans[i]._id + '/menu'
            });
            google.maps.event.addListener(marker, 'click', function() {
                window.location.href = this.url;
            });
        }


        //try get user location
        if (navigator.geolocation) {
            //pan to user
            var CURRENT_LAT = 0, CURRENT_LONG = 0;
            navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                };
                map.setCenter(pos);
                CURRENT_LAT = pos.lat;
                CURRENT_LONG = pos.lng;
            
                vans.sort((van1, van2) => {
                    return mapDistance(parseFloat(van1.lat), parseFloat(van1.long), CURRENT_LAT, CURRENT_LONG) - 
                    mapDistance(parseFloat(van2.lat), parseFloat(van2.long), CURRENT_LAT, CURRENT_LONG)
                })

                var SHOW_CLOSEST_COUNT = 5;
                var closest_five_vans = vans.slice(0, SHOW_CLOSEST_COUNT)
                mapAddButtonTitle(map);
        
                for(i = 0; i < closest_five_vans.length; i++) {
                    mapAddButton(map, closest_five_vans[i].name, {lat: parseFloat(closest_five_vans[i].lat), lng: parseFloat(closest_five_vans[i].long)});
                }
                
            }, function errorCallback(error) {
                alert("Cannot access geo-location");
              })
        }
        else {
            alert("Oh! Can Not Get User-Location!")
        }
    })
}