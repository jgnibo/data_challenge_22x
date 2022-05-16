import React, { Component } from 'react';
import './App.css';
import LineGraph from './components/line_graph';
import BarGraph from './components/bar'
import Map from './components/map'



class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h1 id="title">Superstore Dataset</h1>
                <div id="modules">
                    <BarGraph height={800} width={1000} />
                    <Map height={600} width={1000} />
                    <LineGraph height={800} width={1000} />
                </div>
            </div>
            
        );
    }
}

export default App;
