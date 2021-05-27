mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: currCamp.geometry.coordinates,
  zoom: 10
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
  .setLngLat(currCamp.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({offset: 10})
      .setHTML(
        `<h3>${currCamp.title}</h3> <p>${currCamp.location}</p>`
      )
  )
  .addTo(map);