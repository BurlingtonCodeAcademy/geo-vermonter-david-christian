// Brought in neccessary Dependancies
import React from 'react';
import './App.css';
import { Map, TileLayer, Polygon, Polyline } from 'react-leaflet';
import borderData from './border.js';
import L from 'leaflet'
import leafletPip from 'leaflet-pip'

// Sets up clean state to be used to re-set the game when the game has ended for any reason
const cleanState = {
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
    userName: 'Your Name',
    defaultZoom: 7,
    startLat: [],
    startLon: []
    // + add any additional state items here
}

// Sets up the main VTMap componenet that handles the majority of the application
class VTMap extends React.Component {
    constructor(props) {
        super(props)

        this.state = cleanState
    }

    // Initializes Local Storage information needed to set up previous game statu(s)
    componentDidMount() {
        let storageRecords = JSON.parse(localStorage.getItem('score')) || []

        let lastGameScore = storageRecords.length >= 1 ? storageRecords[storageRecords.length - 1].score : ''
        let secondLastGameScore = storageRecords.length >= 1 ? storageRecords[storageRecords.length - 2].score : ''
        
        // Commented out the 4 lines below (lines 46/51/56/60) to keep as examples of how the game history display can be expanded furthur easily..
        // let thirdLastGameScore = storageRecords.length >= 1 ? storageRecords[storageRecords.length - 3].score : ''

        let lastGameName = storageRecords.length >= 1 ? storageRecords[storageRecords.length - 1].userName : ''
        let secondLastGameName = storageRecords.length >= 1 ? storageRecords[storageRecords.length - 2].userName : ''
        
        // let thirdLastGameName = storageRecords.length >= 1 ? storageRecords[storageRecords.length - 3].userName : ''

        this.setState({
            lastGameScore: lastGameScore,
            secondLastGameScore: secondLastGameScore,
            // thirdLastGameScore: thirdLastGameScore,

            lastGameName: lastGameName,
            secondLastGameName: secondLastGameName,
            // thirdLastGameName: thirdLastGameName
        })
    }

    // Itterate over indexs [0] and [1] in each array in the list of arrays and return the highest of each value
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
        return (Math.random() * (max - min)) + min;
    }

    randPoint = (array) => {
        let randoLon = this.getRndInteger(array[0], array[1])

        let randoLat = this.getRndInteger(array[2], array[3])

        return (
            [randoLon, randoLat]

        )
    }

    // Logic to check if the randomly chosen point is within the Border of Vermont (VTBorder)
    checkValidPoint = (layer, rect, pin) => {
        if (layer.length) {

            return pin
        }
        else {

            let newPin = this.randPoint(rect)
            let newLayer = (leafletPip.pointInLayer([newPin[1], newPin[0]], L.geoJSON(borderData)))
            return this.checkValidPoint(newLayer, rect, newPin)
        }
    }

    // Handles Start Button Click Event
    clickHandlerStart = (evt) => {
        evt.preventDefault();

        this.setState({
            playing: true,
            points: 100
        })

        let corners = this.getCorners(borderData)

        let pinDraft = this.randPoint(corners) //this is the point on the map we are going to check

        let geoJsonData = L.geoJSON(borderData)

        let layerDraft = (leafletPip.pointInLayer([pinDraft[0], pinDraft[1]], geoJsonData))

        let validPoint = this.checkValidPoint(layerDraft, corners, pinDraft)

        const { locationArray } = this.state

        const latLonArray = locationArray.concat([validPoint])

        this.setState({
            mapLat: validPoint[0],
            mapLon: validPoint[1],
            locationArray: latLonArray,
            startLat: validPoint[0],
            startLon: validPoint[1],
            defaultZoom: 18,
            latitude: '?',
            longitude: '?',
            county: '?',
            town: '?',
            status: 'Game Started, Awaiting your first guess..'
        })

        // Pulling the county/lat/town/village(not county according to Postman?) --  --All Info stored in variable 'townData'
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${validPoint[0]}&lon=${validPoint[1]}&format=geojson`)
            .then((res) => res.json())
            .then((obj) => {
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

    // Handles Give Up Button and then displays current location data + makes the start button available again
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
                status: 'Better Luck Next Time!',
                playing: false,
                locationArray: [],
                modalDisplayed: false,
                defaultZoom: 14
            })
        }

    }

    // This section handles the Guess Button + Guess Logic 
    guessButtonHandler = (evt) => {
        evt.preventDefault();

        let check = evt.target.innerHTML + 'County';

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
                playing: false,
                locationArray: [],
                modalDisplayed: false,
                defaultZoom: 14
            })

            let scoreArr = JSON.parse(localStorage.getItem('score')) || [] // if scores is empty, localStorage.getItem('scores') is null, which is falsey, so it will be an empty array
            let finalScore = this.state.points
            let userName = this.state.userName // Ask for username function
            let scoreObj = {
                userName: userName,
                score: finalScore,

            }

            scoreArr.push(scoreObj)

            localStorage.setItem('score', JSON.stringify(scoreArr))

            console.log(scoreArr)

        } else {

            this.setState(state => ({
                status: 'Wrong! Guess again or keep searching!',
                points: state.points - 10,
            }))
        }
    }

    // Handles Guess Modal Display
    guessHandler = (evt) => {
        if (evt.target.textContent === 'Guess') {
            this.setState({
                modalDisplayed: true
            })
        }
    }

    // Handles Movement Buttons 
    moveHandler = (evt) => {
        evt.preventDefault()

        const { locationArray } = this.state
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

                    let southLat = this.state.mapLat - 0.002
                    const southLatLonArray = locationArray.concat([[southLat, this.state.mapLon]])
                    this.setState((prevState) => {
                        return {
                            mapLat: southLat,
                            points: prevState.points -= 1,
                            locationArray: southLatLonArray,
                        }
                    })
                    break

                case 'East':

                    let eastLon = this.state.mapLon + 0.002
                    const eastLatLonArray = locationArray.concat([[this.state.mapLat, eastLon]])

                    this.setState((prevState) => {
                        return {
                            mapLon: eastLon,
                            points: prevState.points -= 1,
                            locationArray: eastLatLonArray,
                        }
                    })
                    break

                case 'West':

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
                        return {
                            mapLat: prevState.startLat,
                            mapLon: prevState.startLon
                        }
                    })
                    break


                default:
                    break
            }


        }

    }

    // Handles Cancel button eveent
    cancelHandler = (evt) => {
        evt.preventDefault();

        if (evt.target.textContent === 'Cancel') {
            this.setState({
                modalDisplayed: false,
            })
        }
    }

    // Handles Username submit event
    handleUsernameSubmit = evt => {
        evt.preventDefault();

        alert('Your username is: ' + this.input.value);
        this.setState({ userName: this.input.value });
    };

    render() {

        // Centering the map on [44.0886, -72.7317]
        let vtBorder = borderData.geometry.coordinates[0].map(coordSet => {
            return [coordSet[1], coordSet[0]]
        })

        return ( // You can only return one thing, so put entire JSX in one div
            <div className="wholePage" id='mainContainer'>
                <div className='wholePage' id='header'>
                    <h1>GeoVermonter</h1>
                    <form id='nameForm' onSubmit={this.handleUsernameSubmit}>
                        <label>Enter your username or</label>
                        <label>Change you current name</label>
                        <input
                            type="text"
                            name="username"
                            ref={(input) => this.input = input}
                        />
                        <button type='submit'>Submit</button>
                    </form>
                </div>
                <div className='wholePage' id='centerRow'>
                    <div id='container'>
                        <h3>Username : {this.state.userName}</h3>
                        <div>
                            <h3>Status : {this.state.status} </h3>
                        </div>
                        <h3>Score : {this.state.points}</h3>
                        <div id='statusBar'>
                            <h2>Latitude = {this.state.latitude} </h2>
                            <h2>Longitude = {this.state.longitude} </h2>
                            <h2>County = {this.state.county}  </h2>
                            <h2>Town = {this.state.town}</h2>
                        </div>
                    </div>
                    <div id='containerTwo'>
                        {this.state.modalDisplayed === true ? <GuessCountyModal handleCancel={this.cancelHandler} listGuess={this.guessButtonHandler} /> : null}
                        <div>

                            <div id='gameButtons'>
                                <button className='gameButton' disabled={this.state.playing} onClick={this.clickHandlerStart}>Start Game</button>
                                <button className='gameButton' disabled={!this.state.playing} onClick={this.guessHandler}>Guess</button>
                                <button className='gameButton' disabled={!this.state.playing} onClick={this.giveUpHandler}>Give Up</button>

                            </div>
                        </div>
                        <div id='mapSection'>
                            <Map center={[this.state.mapLat, this.state.mapLon]} zoom={this.state.defaultZoom} style={{ height: '650px', width: '650px' }} zoomControl={false} scrollWheelZoom={false} touchZoom={false} doubleClickZoom={false} dragging={false}>
                                <TileLayer
                                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />
                                <Polyline key='drawline' positions={this.state.locationArray} color={'blue'} />
                                <Polygon positions={vtBorder} />

                            </Map>
                        </div>
                    </div>
                    <div id='containerThree'>
                        <h2>Previous Game Log</h2>
                        <div id='containerFour'>
                            <div id='scoreRowOne'>
                                <h4>1 : {this.state.lastGameName}</h4>
                                <h5>2 : {this.state.secondLastGameName}</h5>
                            </div>
                            <div id='scoreRowTwo'>
                                <h4>1 : {this.state.lastGameScore}</h4>
                                <h5>2 : {this.state.secondLastGameScore}</h5>
                            </div>
                        </div>
                        <div id='centerButtons'>
                            <div id='navigationButtons'>
                                <button className='gameButton' onClick={this.moveHandler}>North</button>
                                <div id='eastWestButtons'>
                                    <button className='gameButton' onClick={this.moveHandler}>West</button>
                                    <button className='gameButton' onClick={this.moveHandler}>East</button>
                                </div>
                                <button className='gameButton' onClick={this.moveHandler}>South</button>
                                <button className='gameButton' onClick={this.moveHandler}>Return</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

// Guess Modal 
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
