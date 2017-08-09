window.onload = getMyLocation;

var map;
var watchId = null;
var options = {
	enableHighAccuracy: true,
	timeout: 100,
	maximumAge: 0
};
var prevCords = null;

function watchLocation() {
    watchId = navigator.geolacation.watchPosition(displayLocation, displayError); // {timeout:5000}
}

function clearWatch() {
	if (watchId) {
		navigator.geolocation.clearWatch(watchId);
		watchId = null;
	}
}


function getMyLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			displayLocation,
		  displayError,
		  options);
		var watchButton = document.getElementById("watch");
		watchButton.onclick  = watchLocation;
		var clearWatchButton = document.getElementById("clearWatch");
		clearWatchButton.onclick = clearWatch;
	} else{
		alert("Oops, no geolocation support")
	}
}

function displayLocation(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	var div = document.getElementById("location");
	div.innerHTML="You are at Latitude:" + latitude + ",Longitude: " + longitude;
	div.innerHTML+="(with "+ position.coords.accuracy + "meters accuracy)";
	var km = computeDistance(position.coords, ourCoords);
	var distance = document.getElementById("distance");
	distance.innerHTML = "You are " + km + " from the WickedlySmart HQ";
   
  div.innerHTML += " (found in" + options.timeout + "milliseconds)"; 

  if (map == null) {
  initMap(position.coords);
  prevCoords = position.coords;
  } else {
  	var meters = computeDistance(position.coords, prevCoords) * 1000;
  	if (meters>20) {
       scrollMaoToPosition(position.coords);
       prevCoords = position.coords;
  	}
  }
}

function displayError(error) {
	var errorTypes={
		0: "Unknown error",
		1: "Permission denied by user",
		2: "Position is not available",
		3: "Request timed out"
	};
	var errorMessage = errorTypes[error.code];
	if (error.code == 0 || error.code == 2) {
		errorMessage = errorMessage + " " + errorMessage;
	}
	var div = document.getElementById("location");
	div.innerHTML = errorMessage;
	options.timeout +=100;
	navigator.geolocation.getCurrentPosition(
		displayLocation,
		displayError,
		options);
	div.innerHTML += " ... checking again with timeout=" + options.timeout;
}

var ourCoords = {
	latitude: 53.9573946,
	longitude: 27.6075734
};

function computeDistance(startCoords, destCoords) {
	var startLatRads = degreesToRadians(startCoords.latitude);
	var startLongRads = degreesToRadians(startCoords.longitude);
	var destLatRads = degreesToRadians(destCoords.latitude);
	var destLongRads = degreesToRadians(destCoords.longitude);

	var Radius = 6371; // радмус Земли в километрах
	var distance = Math.cos(Math.sin(startLatRads)*Math.sin(destLatRads)
		+ Math.cos(startLatRads)* Math.cos(destLatRads) * 
		Math.cos(startLongRads- destLongRads)) * Radius;
	return distance;
}

function degreesToRadians(degrees) {
	var radians = (degrees *Math.PI)/180;
	return radians;
}

function initMap(coords) {
	var googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);  // latitude: 47.624851 longitude: -122.52099

	var mapOptions = {
		zoom: 10,
		center: googleLatAndLong,
	mapTypeId: google.maps.MapTypeId.ROADMAP // satellite and hybrid
};
var mapDiv = document.getElementById("map");
map= new google.maps.Map(mapDiv, mapOptions);

var title = "Your Location";
var content = "You are here:" + coords.latitude + ", "+coords.longitude;
addMarker(map, googleLatAndLong, title, content);
}

function addMarker(map, latlong, title, content) {
	var markerOptions = {
		position: latlong,
		map: map,
		title: title,
		clickable: true
	};
	var marker = new google.maps.Marker(markerOptions);

	var infoWindowOptions = {
		content: content,
		position: latlong
	};
	var infoWindow = new google.maps.infoWindow(infoWindowOptions);
	google.maps.event.addListener(marker, "click", function() {
	infoWindow.open(map);
	}) 
}