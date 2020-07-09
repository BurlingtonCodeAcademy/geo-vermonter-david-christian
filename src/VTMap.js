import React from 'react';
import { Map, TileLayer, Polygon } from 'react-leaflet';
import borderData from './border.js';
import L from 'leaflet'
import leafletPip from 'leaflet-pip'

class VTMap extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }
    // itterate over indexs [0]  and [1] in each array in the list of arrays and return the highest of each value
    getCorners = (geoJson) => {

        let coordArray = geoJson.geometry.coordinates[0]

        let maxLat = coordArray.reduce((a, b) => (a[0] > b[0]) ? a : b)
        let minLat = coordArray.reduce((a, b) => (a[0] < b[0]) ? a : b)

        let maxLon = coordArray.reduce((a, b) => (a[1] > b[1]) ? a : b)
        let minLon = coordArray.reduce((a, b) => (a[1] < b[1]) ? a : b)

        return (
            [minLat[0], maxLat[0], minLon[1], maxLon[1]]
        )
    }

    getRndInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }



    randPoint = (array) => {
        let randoLat = this.getRndInteger(array[0], array[1])

        let randoLon = this.getRndInteger(array[2], array[3])

        return (
            [randoLat, randoLon]
        )
    }

    checkValidPoint = (layer, rect, pin) => {
        if (layer.length) {
            return pin
        }
        else {
            let pin = this.randPoint(rect)
            let inLayer = (leafletPip.pointInLayer([pin[0], pin[1]], L.geoJSON(borderData)))

            this.checkValidPoint(inLayer, rect, pin)
        }
    }

    render() {

        let corners = this.getCorners(borderData)

        let pinDraft = this.randPoint(corners) //this is the point on the map we are going to check

        let layerDraft = (leafletPip.pointInLayer([pinDraft[0], pinDraft[1]], L.geoJSON(borderData)))

        let validPoint = this.checkValidPoint(layerDraft, corners, pinDraft)

        console.log(validPoint)

        // console.log(inLayer)
        // if (inLayer.length) {
        // console.log('This is in the rectangle')
        // }
        // 
        // else{
        // 
        // console.log('This is not inside the rectangle')
        // }

        let vtBorder = borderData.geometry.coordinates[0].map(coordSet => {
            return [coordSet[1], coordSet[0]]
        })

        return (
            <Map center={[44.0886, -72.7317]} zoom={8} style={{ height: '600px', width: '600px' }}>
                <TileLayer
                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />

                <Polygon positions={vtBorder} />
            </Map>

        )
    }
}

export default VTMap
