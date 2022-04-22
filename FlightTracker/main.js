// IIFE
(() => {

    //create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([42, -60], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var myIcon = L.icon({
            iconUrl: 'plane.png',
            iconSize: [19, 47],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],           
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        });
   
        //create variable to hold markers
         var layerGroup = L.layerGroup().addTo(map);   
   
        //call pop map to initially set up plane positions    
        popMap();

        //set call back timer to repopulate map
        var populateMap = setInterval(popMap, 8000);

        function popMap(){

            //fetch the api data
            fetch('https://opensky-network.org/api/states/all')
            .then((response) => response.json())
            .then((json) => {      
                
                //clear map
                layerGroup.clearLayers();    

                //reset the arrays
                let filteredArray=[];
                let newArray=[];

                filteredArray =json.states.filter((flights) => flights[2].includes("Canada"));         
                        
                //create a new array to store the converted GEOJson
                newArray = filteredArray.map((geoJson) => {
                    return{
                        "type": "Feature",
                        "properties": {
                            "name": geoJson[1],
                            "popupContent": "Origin Country: " + geoJson[2] 
                             + "<br/>" + "Call Sign: "+ geoJson[1] 
                             + "<br/>" + "Speed: " + geoJson[9] + " m/s"
                             + "<br/>" + "Altitude: " +geoJson[7] +" m"                                                                                      
                        },
                        "rotationAngle": geoJson[10],
                        "geometry": {
                            "type": "Point",
                            "coordinates": [geoJson[5], geoJson[6]],
                            "lat" : geoJson[5]
                        }
                    }
                })                         
            
                //bind the popup message to the planes, bind the icon to the points
                //https://leafletjs.com/examples/geojson/    
                function onEachFeature(feature, layer) {                   
                    if (feature.properties && feature.properties.popupContent) {
                        layer.bindPopup(feature.properties.popupContent);
                        layer.setIcon(myIcon);
                        layer.setRotationAngle(feature.rotationAngle);   //grab the rotationAngel for directing the plant te right way                   
                    }
                }
                    
                //https://leafletjs.com/examples/geojson/                
                L.geoJSON(newArray, {
                    onEachFeature: onEachFeature
                }).addTo(layerGroup);             

            })
        }
})()