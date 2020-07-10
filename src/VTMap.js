import React from 'react';
import './App.css';
import { Map, TileLayer, Polygon } from 'react-leaflet';
import borderData from './border.js';
import L from 'leaflet'
import leafletPip from 'leaflet-pip'
let defaultPos = [44.0886, -72.7317]
let defaultZoom = 8


class VTMap extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            latitude: '',
            longitude: '',
            county: '',
            town: '',
        }
    }

    // itterate over indexs [0]  and [1] in each array in the list of arrays and return the highest of each value
    getCorners = (geoJson) => {

        let maxLon = -73.35218
        let minLon = -71.510225

        let maxLat = 45.005419
        let minLat = 42.730315
        return (
            [minLat, maxLat, minLon, maxLon]
        )
    }

    getRndInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    randPoint = (array) => {
        let randoLon = this.getRndInteger(array[0], array[1])

        let randoLat = this.getRndInteger(array[2], array[3])

        return (
            [randoLon, randoLat]

        )
    }

    checkValidPoint = (layer, rect, pin) => {
        if (layer.length) {
            console.log(`Correct length, returning pin: ${pin}`)
            return pin
        }
        else {
            console.log("Invalid point...")
            let newPin = this.randPoint(rect)
            let newLayer = (leafletPip.pointInLayer([pin[1], pin[0]], L.geoJSON(borderData)))
            return this.checkValidPoint(newLayer, rect, newPin)
        }

    }

    clickHandlerStart = (evt) => {
        evt.preventDefault()
        this.setState({
            playing: true
        })
        let myMap = document.getElementById('mainMap')

        let corners = this.getCorners(borderData)

        let pinDraft = this.randPoint(corners) //this is the point on the map we are going to check

        let geoJsonData = L.geoJSON(borderData)

        let layerDraft = (leafletPip.pointInLayer([pinDraft[1], pinDraft[0]], geoJsonData))

        let validPoint = this.checkValidPoint(layerDraft, corners, pinDraft)

        console.log(`This is the valid point: ${validPoint}`)
        defaultPos = validPoint
        defaultZoom = 18

        this.setState({
            latitude: '?',
            longitude: '?',
            county: '?',
            town: '?',
        })
    }

render() {

    let vtBorder = borderData.geometry.coordinates[0].map(coordSet => {
        return [coordSet[1], coordSet[0]]
    })
    // Centering the map on [44.0886, -72.7317]

    return ( // You can only return one thing, so put entire JSX in one div
        <div id='container'>
            <h2>Latitude = {this.state.latitude} </h2>
            <h2>Longitude = {this.state.longitude} </h2>
            <h2>County = {this.state.county}  </h2>
            <h2>Town = {this.state.town}</h2>
            <Map center={defaultPos} zoom={defaultZoom} style={{ height: '600px', width: '600px' }} >
                <TileLayer
                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />

                <Polygon positions={vtBorder} />

            </Map>
            <div>
                <button disabled={this.state.playing} onClick={this.clickHandlerStart}>Start Game</button>
                <button disabled={!this.state.playing}>Guess</button>
                <button disabled={!this.state.playing}>Give Up</button>
            </div>
        </div>

    )
}
}

export default VTMap
