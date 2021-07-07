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
            <VTMap />
        )
    }
}

export default App;
