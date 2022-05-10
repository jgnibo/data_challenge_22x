import React, { Component, useCallback } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { enableAllPlugins, produce } from 'immer';
import * as d3 from 'd3';
import consumerData from './../notebooks/consumer_sub_sales.csv'
import corporateData from './../notebooks/corporate_sub_sales.csv'
import homeData from './../notebooks/home_sub_sales.csv'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import './bar.css';

enableAllPlugins();


class BarGraph extends Component {
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
            const newData = data.map((d) => {
                return {
                    'Subcategory': d['Subcategory'],
                    'Sales Percentage': parseFloat(d['Sales Percentage']),
                    'Profit Percentage': parseFloat(d['Profit Percentage']),
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
        const margin = { top: 10, right: 30, bottom: 100, left: 50 };

        const svg = d3
            .select('#bar-viz')
            .append('svg')
            .attr('width', this.props.width)
            .attr('height', this.props.height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
        
            
            
    }

    updateChart(data) {
        const margin = { top: 10, right: 50, bottom: 100, left: 50 };
        const width = this.props.width - margin.left - margin.right;
        const height = this.props.height - margin.top - margin.bottom;

        const yMin = d3.min(data, (d) => d['Sales Percentage']);
        const yMax = d3.max(data, (d) => d['Sales Percentage']);

        const xMin = d3.min(data, (d) => d['Subcategory']);
        const xMax = d3.max(data, (d) => d['Subcategory']);

        const colorMin = d3.min(data, (d) => d['Profit Percentage']);
        const colorMax = d3.max(data, (d) => d['Profit Percentage']);

        const svg = d3
            .select('#bar-viz').select('svg')

        const colorScale = d3
            .scaleLinear()
            .domain([colorMin, colorMax])
            //.range(['#BA1D53', '#FF0540'])
            .range(['#BA1D53', '#FFFFFF'])
            
        // X axis code
        var xScale = d3
            .scaleBand()
            .range([0, width])
            .domain(data.map((d) => { 
                return d['Subcategory'] }))
            .padding(0.2);
        svg
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${margin.left}, ${height})`)
            .call(
                d3.axisBottom(xScale)
            )
            .selectAll('text')
                .attr('transform', 'translate(-10, 10)rotate(-45)')
                .attr("fill", "#ffffff")
                .style('text-anchor', 'end');
        
        
        
        // Y axis code
        
        const yScale = d3
            .scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);
        
        svg
            .append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .attr('class', 'y-axis')
            .call(
                d3.axisLeft(yScale)
            );

        const tooltip = d3.select('#bar-viz')
            .append('div')
            .attr('class', 'bar-tooltip')
            .style('opacity', 0)

        
        // Bar code
        
        svg
            .selectAll('bar')
            .data(data)
            .enter()
            .append('rect')
                .attr('transform', `translate(${margin.left}, 0)`)
                .attr('x', (d) => { return xScale(d['Subcategory']); })
                .attr('width', xScale.bandwidth())
                .attr('fill', (d) => { 
                    return colorScale(d['Profit Percentage']); })
                .attr('height', (d) => { return height - yScale(0); })
                .attr('y', (d) => { return yScale(0); })
        
        // Animation
        svg
            .selectAll('rect')
            .transition()
            .duration(1000)
            .attr('y', (d) => { return yScale(d['Sales Percentage']); })
            .attr('height', (d) => { return height - yScale(d['Sales Percentage']); })
            .attr('fill', (d) => { return colorScale(d['Profit Percentage']); })
        
        
        
        
        // Tooltip
        svg
            .selectAll('rect')
            .on('mouseover', (d) => {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1)
            })
            .on('mousemove', (event, d) => {
                tooltip
                    .style('left', event.pageX - 75 + 'px')
                    .style('top', event.pageY - 100 + 'px')
                    .html(`<h1>${d['Subcategory']}</h1><p>Sales Percentage: ${d['Sales Percentage'].toFixed(1)}</p><p>Profit Percentage: ${d['Profit Percentage'].toFixed(1)}</p>`);
                    //.style('display', 'inline-block')
            })
            .on('mouseout', (d) => {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            })
        
        /*svg.selectAll('div').exit().remove(); */
        svg.selectAll('rect').data(data).exit().remove();
        svg.selectAll('.bar-tooltip').data(data).exit().remove();

        var yAxis = 
        svg.selectAll('g.y-axis').call()
        
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
        if (this.state.workingData) {
            this.updateChart(this.state.workingData);
        } else {
            return (
                <div>Loading...</div>
            );
        }
    }

    render() {
        return (
            <div id="bar-viz-wrapper" className="viz-module">
                <h2 className="module-header">Segmented Profit by Subcategory</h2>
                <div className="selectors">
                    <RadioGroup onChange={this.optionClicked} row aria-labelledby="demo-radio-buttons-group-label" defaultValue="consumer" name="radio-buttons-group">
                        <FormControlLabel value="consumer" control={<Radio />} label="Consumer" />
                        <FormControlLabel value="corporate" control={<Radio />} label="Corporate" />
                        <FormControlLabel value="home" control={<Radio />} label="Home Office" />
                    </RadioGroup>
                </div>
                {this.renderGraph()}
                <div id="bar-viz">

                </div>
            </div>
        );
        
    }
}

export default BarGraph;