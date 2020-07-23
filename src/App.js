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
            <div className='wholePage'>
                <div className='wholePage'>
                    <VTMap />
                </div>               
            </div>
        )
    }
}

export default App;
