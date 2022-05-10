import logo from './logo.svg';
import React, { Component } from 'react';
import './App.css';
import LineGraph from './components/line_graph';
import BarGraph from './components/bar'



class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h1 id="title">Superstore Dataset</h1>
                
                <BarGraph height={600} width={1000} />
            </div>
            
        );
    }
}

export default App;
