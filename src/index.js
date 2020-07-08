import React from 'react';
import ReactDOM from 'react-dom';
import VTMap from './VTMap.js';

ReactDOM.render(
  <div>
    <h1>Hello World!</h1>
  <div style={{ height: '600px', width: '600px' }}>
      <VTMap />
    </div>
  </div>,
  document.getElementById('root')
)