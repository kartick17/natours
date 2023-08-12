const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FydGljazE3IiwiYSI6ImNsbDdvYmo1dzEzNjgzbG8xcDRyamNhNjEifQ.SEDc6S6qS93b_CHnZm8Pdg';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kartick17/cll8dwhak00ni01pb68vk75dj',
    scrollZoom: false
    // center: [-118.103472, 34.111725],
    // zoom: 10,
    // interactive: false
})

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat(loc.coordinates)
        .addTo(map)

    // Add Popup
    new mapboxgl.Popup({
        offset: 40
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

    // Extends map bounds to include current location
    bounds.extend(loc.coordinates)
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        left: 100,
        right: 100,
        bottom: 100
    }
})