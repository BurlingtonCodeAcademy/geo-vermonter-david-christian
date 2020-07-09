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
    clickHandler = (evt) => {
        evt.preventDefault(

            this.setState({
                playing: true
            })
        )
    }
    
    
    render() {

        return (
            <div>
                <div style={{ height: '600px', width: '600px' }}>
                    <VTMap />
                </div>
                <div>
                    <button disabled={this.state.playing} onClick={this.clickHandler}>Start Game</button>
                    <button disabled={!this.state.playing}>Guess</button>
                    <button disabled={!this.state.playing}>Give Up</button>
                </div>
            </div>
        )
    }
}

export default App;
