import React from 'react';
import VTMap from './VTMap.js';


class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            playing: false,

        }
    }

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
