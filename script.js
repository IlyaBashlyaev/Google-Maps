mapboxgl.accessToken = 'pk.eyJ1IjoiaWx5YWJhc2hseWFldiIsImEiOiJja2hseWN5eWMwNWFvMnFsOWI1MDZibjk0In0.QB9ejLHC8iptHLZhsXfBpQ'

var userCoords = [30.5, 50.5],
    lastMiles = '',
    lastIndex = 0,
    layers = ['dark', 'light', 'outdoors', 'satellite', 'streets'],
    currentLayerIndex = parseInt(localStorage.getItem('current-layer-index'))

if (!currentLayerIndex && currentLayerIndex != 0)
    currentLayerIndex = 3

var layerId = layers[currentLayerIndex]
if (layerId == 'satellite') {layerId += '-streets-v9'}
else if (layerId == 'light' || layerId == 'dark') {layerId += '-v10'}
else if (layerId == 'streets' || layerId == 'outdoors') {layerId += '-v11'}

navigator.geolocation.getCurrentPosition(
    succesLocation,
    errorLocation,
    {enableHighAccuracy: true}    
)

function directionsClick(index) {
    if (index != lastIndex) {
        const directionLabels = document.querySelectorAll('.mapbox-directions-clearfix label'),
              currentDirectionLabel = directionLabels[index],
              lastDirectionLabel = directionLabels[lastIndex]
        
        currentDirectionLabel.classList.add('active')
        lastDirectionLabel.classList.remove('active')

        lastIndex = index
    }
}

function succesLocation(position) {
    userCoords = [
        position.coords.longitude,
        position.coords.latitude
    ]

    setupMap(
        [userCoords[0], userCoords[1]],
        'mapbox://styles/mapbox/' + layerId
    )
}

function errorLocation() {
    setupMap(
        [userCoords[0], userCoords[1]],
        'mapbox://styles/mapbox/' + layerId
    )
}

function watchMilesEl() {
    const milesEl = document.querySelector('.mapbox-directions-route-summary h1')

    if (milesEl) {
        var miles = milesEl.innerText.slice(0, -2)
        if (miles != lastMiles) {
            miles = Math.round(miles * 160.9) / 100
            milesEl.innerText = miles + 'km'
            lastMiles = miles
        }
    }

    requestAnimationFrame(watchMilesEl)
}
watchMilesEl()

function setCurrentLayer() {
    const currentLayer = document.querySelector('.current-layer')
    currentLayer.style.backgroundImage = `url(images/maps/${layers[currentLayerIndex]}.jpg)`

    const otherLayers = document.querySelectorAll('.other-layers .layer')
    var index = 0

    for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        if (layerIndex != currentLayerIndex) {
            var otherLayer = otherLayers[index]
            otherLayer.setAttribute('index', layerIndex)
            otherLayer.style.backgroundImage = `url(images/maps/${layers[layerIndex]}.jpg)`
            index++
        }
    }
}
setCurrentLayer()

function showLayers() {
    var otherLayers = document.querySelector('.other-layers')

    if (!otherLayers.classList.contains('active')) {
        otherLayers.classList.add('active')
        otherLayers = otherLayers.querySelectorAll('.layer')
        var index = 0

        for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            if (layerIndex != currentLayerIndex) {
                var otherLayer = otherLayers[index],
                    layerId = layers[layerIndex]
                
                if (layerId == 'satellite') {layerId += '-streets-v9'}
                else if (layerId == 'light' || layerId == 'dark') {layerId += '-v10'}
                else if (layerId == 'streets' || layerId == 'outdoors') {layerId += '-v11'}
                otherLayer.setAttribute('layer-id', layerId)

                var layerText = otherLayer.querySelector('.layer-text'),
                    layerTitle = layers[layerIndex].split('')

                layerTitle[0] = layerTitle[0].toUpperCase()
                layerTitle = layerTitle.join('')

                layerText.innerHTML = `<i class="fas fa-layer-group"></i><span>&nbsp;${layerTitle}</span>`
                index++
            }
        }
    }

    else
        otherLayers.classList.remove('active')
}

function setLayer(layer) {
    const layerId = layer.getAttribute('layer-id')
    currentLayerIndex = parseInt(layer.getAttribute('index'))
    localStorage.setItem('current-layer-index', currentLayerIndex)

    const map = document.querySelector('#map')
    map.innerHTML = ''

    setupMap(
        [userCoords[0], userCoords[1]],
        'mapbox://styles/mapbox/' + layerId,
        false
    )

    setCurrentLayer()
    showLayers()
}

function setupMap(center, style, firstTime = true) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: style,
        center: center,
        zoom: 15
    })

    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav, 'bottom-right')

    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    })
    map.addControl(directions, 'top-left')

    const directionLabels = document.querySelectorAll('.mapbox-directions-clearfix label')
    const directionInputs = document.querySelectorAll('.mapbox-directions-clearfix input')

    for (var index = 0; index < directionLabels.length; index++) {
        var directionLabel = directionLabels[index],
            directionInput = directionInputs[index]

        if (directionInput.checked) {
            lastIndex = index
            directionLabel.classList.add('active')
        }

        directionLabel.setAttribute('onclick', `directionsClick(${index})`)
    }

    if (firstTime) {
        const layers = document.querySelector('.layers')
        layers.style.display = 'block'
    }
}