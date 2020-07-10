import React from 'react';
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

        }
    }
    // randomLat = (min, max) => {
    //     let lat = Math.random() * (45.005419 - 42.730315) + 42.730315
    //     return lat
    //   }
    
    //   randomLong = (min, max) => {
    //     let long = (Math.random() * (71.510225 - 73.35218) + 73.35218) * - 1
    //     return long
    //   }
    // itterate over indexs [0]  and [1] in each array in the list of arrays and return the highest of each value
    getCorners = (geoJson) => {

        let coordArray = geoJson.geometry.coordinates[0] // Lon/Lat for GeoJson for some reason

        // let maxLon = coordArray.reduce((a, b) => (a[0] > b[0]) ? a : b)
        // let minLon = coordArray.reduce((a, b) => (a[0] < b[0]) ? a : b)

        // let maxLat = coordArray.reduce((a, b) => (a[1] > b[1]) ? a : b)
        // let minLat = coordArray.reduce((a, b) => (a[1] < b[1]) ? a : b)

        let maxLon =  -73.35218
        let minLon = -71.510225

        let maxLat = 45.005419
        let minLat = 42.730315
        return (
            // [minLat[0], maxLat[0], minLon[1], maxLon[1]]
            [minLat, maxLat, minLon, maxLon]
        )
    }

    getRndInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }



    randPoint = (array) => {
        let randoLon = this.getRndInteger(array[0], array[1])

        let randoLat = this.getRndInteger(array[2], array[3])
        // console.log(array)
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
            console.log('This is in Vermont!');
            return pin
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

 


    }
    
    render() {
        
        let vtBorder = borderData.geometry.coordinates[0].map(coordSet => {
            return [coordSet[1], coordSet[0]]
        })
        // Centering the map on [44.0886, -72.7317]

        return ( // You can only return one thing, so put entire JSX in one div
            <div> 
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
