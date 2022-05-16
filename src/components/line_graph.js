import React, { Component } from 'react';
import Checkbox from '@mui/material/Checkbox';

import FormControlLabel from '@mui/material/FormControlLabel';
import { enableAllPlugins, produce } from 'immer';
import * as d3 from 'd3';
import consumerData from './../notebooks/consumer_q_sales.csv'
import corporateData from './../notebooks/corporate_q_sales.csv'
import homeData from './../notebooks/home_q_sales.csv'

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';


enableAllPlugins();

class LineGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                consumerData: {},
                corporateData: {},
                homeData: {}
            },
            workingData: null
        }
    }

    componentDidMount() {
        this.parseData(consumerData, 'consumerData');
        this.parseData(corporateData, 'corporateData');
        this.parseData(homeData, 'homeData');
        this.createChart();
    }

    parseData(data, segment) {
        d3.csv(data).then((data) => {
            const timeConversion = d3.timeParse("%Y-%m-%d");
            const newData = data.map((d) => {
                return {
                    'Order Date': timeConversion(d['Order Date']),
                    'Sales': parseFloat(d['Sales']),
                    'Profit': parseFloat(d['Profit'])
                }
            })
            this.setState(
                produce((draft) => {
                    draft.data[segment] = newData;
                    if(segment === 'consumerData') {
                        draft.workingData = newData;
                    }
                }),
            );
        }).catch((err) => {
            console.log("error", err);
        });
    }

    createChart = () => {
        const margin = { top: 50, right: 30, bottom: 150, left: 75 };

        const svg = d3
            .select('#line-viz')
            .append('svg')
            .attr('width', this.props.width)
            .attr('height', this.props.height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)

        const xScale = d3
            .scaleLinear()
            .range([0, this.props.width - margin.left - margin.right])
        
        const yScale = d3
            .scaleLinear()
            .range([this.props.height-margin.top-margin.bottom])

        const xAxis = d3
            .axisBottom(xScale)

        const yAxis = d3
            .axisLeft(yScale)
    
        
        svg
            .append('g')
            .attr('class', 'x-axis-line')
            .attr('transform', `translate(0, ${this.props.height-margin.top-margin.bottom})`)
            .call(xAxis);
        
        svg
            .append('g')
            .attr('class', 'y-axis-line')
            .call(yAxis);
    }

    updateChart(data) {
        const margin = { top: 50, right: 50, bottom: 150, left: 75 };
        const width = this.props.width - margin.left - margin.right;
        const height = this.props.height - margin.top - margin.bottom;

        const yMin = d3.min(data, (d) => d['Sales']);
        const yMax = d3.max(data, (d) => d['Sales']);
        const xMin = d3.min(data, (d) => d['Order Date']);
        const xMax = d3.max(data, (d) => d['Order Date']);

        console.log(yMin, yMax, xMin, xMax);

        const svg = d3
            .select('#line-viz').select('svg')
        
        const colorScale = d3
            .scaleLinear()
            .domain(['consumer', 'corporate', 'producer'])
            .range(['#E17768', '#FFB35E', '#F9F871'])
        
        const xScale = d3
            .scaleLinear()
            .range([0, width])
            .domain([xMin, xMax])
        
        const yScale = d3
            .scaleLinear()
            .domain([0, yMax])
            .range([height, 0])

        var salesLine = svg
            .selectAll('path')
            .data([data])

        salesLine
            .enter()
                
        var line = d3
            .line()
            .x(d => xScale(d['Order Date']))
            .y(d => yScale(d['Sales']))
                
        svg
            .append('path')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('class', 'line')
            .attr('d', line); 
        
        svg
            .selectAll('path')
            .transition()
            .duration(1000)
        
        salesLine
            .exit()
            .remove();

        svg.transition().select('.x-axis-line')
            .duration(1000)
            .call(
                d3.axisBottom(xScale).tickFormat((d) => {
                    const date = new Date(d);
                    const month = date.getMonth();
                    const year = date.getFullYear();
                    if (month <= 2) {
                        return "Q1 " + year;
                    } else if (month <= 5) {
                        return "Q2 " + year;
                    } else if (month <= 8) {
                        return "Q3 " + year;
                    } else {
                        return "Q4 " + year;
                    }
                })
            )
            .selectAll('text')
                .attr('transform', 'translate(-10, 10)rotate(-45)')
                .style('text-anchor', 'end');
        
        svg.transition().select('.y-axis-line')
            .duration(1000)
            .call(
                d3.axisLeft(yScale)
            )
    } 

    optionClicked = (event) => {
        if (event.target.value === 'consumer') {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.consumerData;
                }),
            );
        } else if (event.target.value === "corporate") {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.corporateData;
                }),
            );
        } else if (event.target.value === 'home') {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.homeData;
                }),
            );
        }
    }

    renderGraph() {
        if(this.state.workingData) {
            this.updateChart(this.state.workingData);
        } else {
            return (
                <div>Loading...</div>
            );
        }
    }

    render() {
        return (
            <div id="line-viz-wrapper" className="viz-module">
                <h2 className="module-header">Segmented Quarterly Mean Sales</h2>
                <div className="selectors">
                    <RadioGroup onChange={this.optionClicked} row aria-labelledby="demo-radio-buttons-group-label" defaultValue="consumer" name="line-radios">
                        <FormControlLabel value="consumer" control={<Radio />} label="Consumer" />
                        <FormControlLabel value="corporate" control={<Radio />} label="Corporate" />
                        <FormControlLabel value="home" control={<Radio />} label="Home Office" />
                    </RadioGroup>

                </div>
                {this.renderGraph()}
                <div id="line-viz"></div>
                <div className="viz-description">
                    <p>This line graph shows quarterly mean sales by segment. Play with the selectors to see how each segment performed sales-wise, using the provided data grouped into quarters. Pay attention to the y-axis, as the range and scale changes when segments change.</p>
                </div>
            </div>
            
        );
    }


}

export default LineGraph;