import React, { Component } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { enableAllPlugins, produce } from 'immer';
import * as d3 from 'd3';
import consumerData from './../notebooks/consumer_q_sales.csv'
import corporateData from './../notebooks/corporate_q_sales.csv'
import homeData from './../notebooks/home_q_sales.csv'


enableAllPlugins();

class LineGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            consumerSelected: true,
            corporateSelected: false,
            homeSelected: false,
            allSelected: false,
            data: {
                consumerData: {},
                corporateData: {},
                homeData: {}
            }
        }
    }

    componentDidMount() {
        this.parseData(consumerData, 'consumerData');
        this.parseData(corporateData, 'corporateData');
        this.parseData(homeData, 'homeData');
        /*d3.csv(data).then((data) => {
            const timeConversion = d3.timeParse("%Y-%m-%d");
            const newData = data.map((d) => {
                return {
                    'Order Date': timeConversion(d['Order Date']),
                    'Sales': parseFloat(d['Sales'])
                }
            })
            this.setState(
                produce((draft) => {
                    draft.data.consumerData = newData;
                }),
            );
        }).catch((err) => {
            console.log("error", err);
        }); */
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
                }),
            );
        }).catch((err) => {
            console.log("error", err);
        });
    }

    toggleConsumer = () =>  {
        this.setState(
            produce((draft) => {
                draft.consumerSelected = !draft.consumerSelected;
            }),
        );
        console.log(this.state.data);
    }

    toggleCorporate = () => {
        this.setState(
            produce((draft) => {
                draft.corporateSelected = !draft.corporateSelected;
            }),
        );
        this.drawChart(this.state.data.consumerData);
    }

    toggleHome = () =>  {
        this.setState(
            produce((draft) => {
                draft.homeSelected = !draft.homeSelected;
            }),
        );
        console.log(this.state.data);
    }

    toggleAll = () =>  {
        this.setState(
            produce((draft) => {
                draft.allSelected = !draft.allSelected;
                if (draft.allSelected) {
                    draft.consumerSelected = false;
                    draft.corporateSelected = false;
                    draft.homeSelected = false;
                }  else {
                    draft.consumerSelected = true;
                }
            }),
        );
    }

    drawChart(data) {
        const margin = { top: 10, right: 50, bottom: 50, left: 50 }

        console.log(data);
        console.log(data[0]['Sales']);
        const yMinValue = d3.min(data, (d) => d['Sales']);
        const yMaxValue = d3.max(data, (d) => d['Sales']);
        const xMinValue = d3.min(data, d => d['Order Date']);
        const xMaxValue = d3.max(data, d => d['Order Date']);

        console.log(yMinValue, yMaxValue, xMinValue, xMaxValue);

        const svg = d3
            .select('#line-viz')
            .append('svg')
            .attr('width', this.props.width + margin.left + margin.right)
            .attr('height', this.props.height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        

        // X axis code
        const xScale = d3
            .scaleLinear()
            .domain([xMinValue, xMaxValue])
            .range([0, this.props.width]);

        svg
            .append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${this.props.height})`)
            .call(
                d3.axisBottom(xScale)
                    .tickSize(-this.props.height)
                    .tickFormat(''),
            );
        
        svg
            .append('g')
            .attr('class', 'line-text')
            .attr('transform', `translate(0, ${this.props.height})`)
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
                    //d3.timeFormat('%B %Y'))
            );


        

        // Y axis code
        const yScale = d3
            .scaleLinear()
            .domain([0, yMaxValue])
            .range([this.props.height, 0]);
        
        svg
            .append('g')
            .attr('class', 'axis')
            .call(
                d3.axisLeft(yScale)
                    .tickSize(-this.props.width)
                    .tickFormat(''),
            );
        
        svg
            .append('g')
            .attr('class', 'line-text')
            .call(
                d3.axisLeft(yScale)
            );
        
        const line = d3
            .line()
            .x(d => xScale(d['Order Date']))
            .y(d => yScale(d['Sales']))
        
        svg
            .append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('class', 'line')
            .attr('d', line);
    }

    render() {
        return (
            <div id="line-viz-wrapper" className="viz-module">
                <div className="selectors">
                    <FormControlLabel control={<Checkbox defaultChecked onChange={this.toggleConsumer} checked={this.state.consumerSelected} disabled={this.state.allSelected} />} label="Consumer" />
                    <FormControlLabel control={<Checkbox onChange={this.toggleCorporate} checked={this.state.corporateSelected} disabled={this.state.allSelected} />} label="Corporate" />
                    <FormControlLabel control={<Checkbox onChange={this.toggleHome} checked={this.state.homeSelected} disabled={this.state.allSelected} />} label="Home Office" />
                    <FormControlLabel control={<Checkbox onChange={this.toggleAll} checked={this.state.allSelected}/>} label="All" />
                </div>
                <div id="line-viz">

                </div>
            </div>
            
        );
    }


}

export default LineGraph;