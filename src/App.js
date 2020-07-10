import React from 'react';
import VTMap from './VTMap.js';


class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            playing: false,

        }
    }


    // leafletPip.pointInLayer() ended here 7/8/20 ...


    // Methods go here
    // clickHandler = (evt) => {
    //     evt.preventDefault()
    //     this.setState({
    //         playing: true
    //     })

       
    //     let corners = this.getCorners(borderData)

    //     let pinDraft = this.randPoint(corners) //this is the point on the map we are going to check

    //     let layerDraft = (leafletPip.pointInLayer([pinDraft[0], pinDraft[1]], L.geoJSON(borderData)))

    //     let validPoint = this.checkValidPoint(layerDraft, corners, pinDraft)

    //     console.log(`This is the valid point: ${validPoint}`)


    // }


    render() {

        return (
            <div>
                <div style={{ height: '600px', width: '600px' }}>
                    <VTMap />
                </div>               
            </div>
        )
    }
}

export default App;
