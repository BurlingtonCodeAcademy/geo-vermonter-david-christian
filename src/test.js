import React from 'react';
import './App.css';
import { Map, TileLayer, Polygon, Polyline } from 'react-leaflet';
import borderData from './border.js';
import L from 'leaflet'
import leafletPip from 'leaflet-pip'
let defaultZoom = 7

class VTMap extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            latitude: '',
            longitude: '',
            county: '',
            town: '',
            status: 'Game Started, Awaiting your first guess..',
            guess: '',
            modalDisplayed: false,
            points: 100,
            mapLat: 44.0886,
            mapLon: -72.7317,
            locationArray: [],
            highScore: '',
            
        }
    }

    // itterate over indexs [0]  and [1] in each array in the list of arrays and return the highest of each value
    getCorners = () => {

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

    // Logic to check if the randomly chosen point is within the VTBorder
    checkValidPoint = (layer, rect, pin) => {
        if (layer.length) {
            console.log(`Correct length, returning pin: ${pin}`)
            return pin
        }
        else {
            console.log("Invalid point...")
            let newPin = this.randPoint(rect)
            let newLayer = (leafletPip.pointInLayer([newPin[1], newPin[0]], L.geoJSON(borderData)))
            return this.checkValidPoint(newLayer, rect, newPin)
        }
    }

    clickHandlerStart = (evt) => {
        evt.preventDefault();

        this.setState({
            playing: true,
            points: 100
        })
        // let myMap = document.getElementById('mainMap')

        let corners = this.getCorners(borderData)

        let pinDraft = this.randPoint(corners) //this is the point on the map we are going to check

        let geoJsonData = L.geoJSON(borderData)

        let layerDraft = (leafletPip.pointInLayer([pinDraft[0], pinDraft[1]], geoJsonData))

        let validPoint = this.checkValidPoint(layerDraft, corners, pinDraft)

        const {locationArray} = this.state

        const latLonArray = locationArray.concat([validPoint])

        console.log(`This is the valid point: ${validPoint}`)
        this.setState({
            mapLat: validPoint[0],
            mapLon: validPoint[1],
            locationArray: latLonArray
        })

        // console.log(`Map Lat: ${this.state.mapLat}`)
        // defaultPos = validPoint
        defaultZoom = 18

        // when the 'Valid Point' is chosen, the game will reset state to add the ?'s to the info panel
        this.setState({
            latitude: '?',
            longitude: '?',
            county: '?',
            town: '?',
        })

        // pulling the county/lat/town/village(not county according to Postman?) --  --All Info stored in variable 'townData'
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${validPoint[0]}&lon=${validPoint[1]}&format=geojson`)
            .then((res) => res.json())
            .then((obj) => {
                console.log(obj)
                this.setState({
                    townData: {
                        latitude: validPoint[0],
                        longitude: validPoint[1],
                        county: obj.features[0].properties.address.county,
                        town: obj.features[0].properties.address.village || obj.features[0].properties.address.hamlet || obj.features[0].properties.address.town || obj.features[0].properties.address.city
                    }
                })
            })
    }

    // Handles guess button and then displays current location data + makes the start button available again
    giveUpHandler = (evt) => {
        evt.preventDefault();

        if (evt.target.textContent === 'Give Up') {
            let latVar = this.state.townData.latitude
            let lonVar = this.state.townData.longitude
            let countyVar = this.state.townData.county
            let townVar = this.state.townData.town

            this.setState({
                latitude: latVar,
                longitude: lonVar,
                county: countyVar,
                town: townVar,
                playing: false
            });
        }

    }

    // This section handles the guess button modal. 
    guessButtonHandler = (evt) => {
        evt.preventDefault();
        let check = evt.target.innerHTML + 'County'
        if (check === this.state.townData.county) {
            // console.log(`${check} is equal to ${this.state.townData.county}`)
            let latVar = this.state.townData.latitude
            let lonVar = this.state.townData.longitude
            let countyVar = this.state.townData.county
            let townVar = this.state.townData.town
            this.setState({
                latitude: latVar,
                longitude: lonVar,
                county: countyVar,
                town: townVar,
                status: 'Correct!',
            })
        } else {
            // 
            // console.log(`${check} is not equal to ${this.state.townData.county}`)
            this.setState(state => ({
                status: 'Wrong! Guess again or keep searching!',
                points: state.points - 10,
            }))
        }

    }
    guessHandler = (evt) => {
        if (evt.target.textContent === 'Guess') {
            this.setState({
                modalDisplayed: true
            })
        }
    }

    moveHandler = (evt) => {
        evt.preventDefault()

        const {locationArray} = this.state
        if (this.state.playing === true) {
            let direction = evt.target.textContent
            switch (direction) {
                case 'North':

                    
                    let northLat = this.state.mapLat + 0.002
                    const northLatLonArray = locationArray.concat([[northLat, this.state.mapLon]])
                    this.setState((prevState) => {
                        return {
                        mapLat: northLat,
                        points: prevState.points -= 1,
                        locationArray: northLatLonArray,
                        }
                    })
                    break

                    
                case 'South':

                    // const {locationArray} = this.state
                    let southLat = this.state.mapLat - 0.002
                    const southLatLonArray = locationArray.concat([[southLat, this.state.mapLon]])
                    this.setState((prevState) => {
                        return{
                        mapLat: southLat,
                        points: prevState.points -= 1,
                        locationArray: southLatLonArray,
                        }
                    })
                
                    break

                case 'East':

                    // const {locationArray} = this.state
                    let eastLon = this.state.mapLon + 0.002
                    const eastLatLonArray = locationArray.concat([[this.state.mapLat, eastLon]])

                    this.setState((prevState) => {
                        return{
                        mapLon: eastLon,
                        points: prevState.points -= 1,
                        locationArray: eastLatLonArray,
                        }
                    })

                    break

                case 'West':

                    // const {locationArray} = this.state
                    let westLon = this.state.mapLon - 0.002
                    const westLatLonArray = locationArray.concat([[this.state.mapLat, westLon]])

                    this.setState((prevState) => {
                        return {
                        mapLon: westLon,
                        points: prevState.points -= 1,
                        locationArray: westLatLonArray,
                        }
                    })
                    break
                    case 'Return':
                    this.setState((prevState) => {
                        return{
                        mapLat: this.state.startLat,
                        mapLon: this.state.startLon
                        }
                    })
                    break

                default:
                    break
            }


        }

    }

    cancelHandler = (evt) => {
        evt.preventDefault();
        console.log('What is this: ' + evt.target.textContent)
        if (evt.target.textContent === 'Cancel') {
            this.setState({
                modalDisplayed: false,
            })
        }
    }

    render() {

        // Centering the map on [44.0886, -72.7317]
        let vtBorder = borderData.geometry.coordinates[0].map(coordSet => {
            return [coordSet[1], coordSet[0]]
        })

        return ( // You can only return one thing, so put entire JSX in one div

            <div id='mainContainer'>

                <div id='statusHeader'>
                    <h2>Status: {this.state.status}</h2>
                    <div id='row'>
                    <h3>Score = {this.state.points}</h3>
                    <h3>HighScore = {this.state.highScore} </h3> 
                    </div>
        
                    <div id='statusBar'>
                        <h2>Latitude = {this.state.latitude} </h2>
                        <h2>Longitude = {this.state.longitude} </h2>
                        <h2>County = {this.state.county}  </h2>
                        <h2>Town = {this.state.town}</h2>
                    </div>
                </div>
                {this.state.modalDisplayed === true ? <GuessCountyModal handleCancel={this.cancelHandler} listGuess={this.guessButtonHandler} /> : null}
                <div>
                    <Map center={[this.state.mapLat, this.state.mapLon]} zoom={defaultZoom} style={{ height: '600px', width: '600px' }} zoomControl={false} scrollWheelZoom={false} touchZoom={false} doubleClickZoom={false} dragging={false}>
                        <TileLayer
                            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />
                        <Polyline key='drawline' positions={this.state.locationArray} color={'blue'} />
                        <Polygon positions={vtBorder} />

                    </Map>
                </div>
                <div id='gameButtons'>
                    <button disabled={this.state.playing} onClick={this.clickHandlerStart}>Start Game</button>
                    <button disabled={!this.state.playing} onClick={this.guessHandler}>Guess</button>
                    <button disabled={!this.state.playing} onClick={this.giveUpHandler}>Give Up</button>

                </div>
                <div id='centerButtons'>
                    <div id='navigationButtons'>
                        <button onClick={this.moveHandler}>North</button>
                        <div id='eastWestButtons'>
                            <button onClick={this.moveHandler}>West</button>
                            <button onClick={this.moveHandler}>East</button>
                        </div>
                        <button onClick={this.moveHandler}>South</button>
                        <button onClick={this.moveHandler}>Return</button>
                    </div>
                </div>
            </div>
        )
    }
}

function GuessCountyModal(props) {
    let countyList = ['Grand Isle', 'Franklin', 'Orleans', 'Essex', 'Chittenden', 'Lamoille', 'Caledonia', 'Washington', 'Addison', 'Bennington', 'Orange', 'Rutland', 'Windham', 'Windsor']
    return (
        <div id='guess-list'>
            <ol>
                {countyList.map(county => (
                    <li className='county-guess' key={county} >
                        <button onClick={props.listGuess}>{county} </button>
                    </li>
                ))}
            </ol>


            <button onClick={props.handleCancel}>Cancel</button>

        </div>
    );
}

export default VTMap
