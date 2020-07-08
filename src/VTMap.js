import React from 'react';
import Leaflet from 'leaflet'
import { Map, TileLayer, Polygon } from 'react-leaflet';
import borderData from './border.js';
// import leaflet-pip from 'react-leaflet';



class VTMap extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }
    render() {
        let vtBorder = borderData.geometry.coordinates[0].map(coordSet => {
            return [coordSet[1], coordSet[0]]
        })
        console.log(vtBorder
            )
        return (
            <Map center={[44.0886, -72.7317]} zoom={8} style={{height:'600px', width:'600px'}}>
                <TileLayer
                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />

                <Polygon positions={vtBorder} />
            </Map>
        )
    }
}

export default VTMap
