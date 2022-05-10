import React, { Component } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { enableAllPlugins, produce } from 'immer';
import * as d3 from 'd3';
import data from './../notebooks/consumer_sub_sales.csv'

import './bar.css';

enableAllPlugins();


class BarGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            consumerSelected: true,
            corporateSelected: false, 
            homeSelected: false,
            allSelected: false,
            data: {}
        }
    }

    componentDidMount() {
        d3.csv(data).then((data) => {
            const newData = data.map((d) => {
                return {
                    'Subcategory': d['Subcategory'],
                    'Sales Percentage': parseFloat(d['Sales Percentage']),
                    'Profit Percentage': parseFloat(d['Profit Percentage'])
                }
            })
            this.setState(
                produce((draft) => {
                    draft.data = newData;
                })
            );
        }).catch((err) => {
            console.log('error', err);
        })
    }

    toggleConsumer = () =>  {
        this.setState(
            produce((draft) => {
                draft.consumerSelected = !draft.consumerSelected;
            }),
        );
        console.log(this.state.consumerData);
    }

    toggleCorporate = () => {
        this.setState(
            produce((draft) => {
                draft.corporateSelected = !draft.corporateSelected;
            }),
        );
        this.drawChart(this.state.data);
    }

    toggleHome = (callback) =>  {
        this.setState(
            produce((draft) => {
                draft.homeSelected = !draft.homeSelected;
            }), this.display)
        
    }

    display() {
        console.log(this.state.homeSelected);
    }

    updateRenderData() {

    }

    toggleAll = () =>  {
        this.setState(
            produce((draft) => {
                draft.allSelected = !draft.allSelected;
                if (draft.allSelected) {
                    draft.consumerSelected = false;
                    draft.corporateSelected = false;
                    draft.homeSelected = false;
                } else {
                    draft.consumerSelected = true;
                }
            }),
        );
    }

    drawChart(data) {
        const margin = { top: 10, right: 50, bottom: 100, left: 50 }
        

        const yMin = d3.min(data, (d) => d['Sales Percentage']);
        const yMax = d3.max(data, (d) => d['Sales Percentage']);

        const xMin = d3.min(data, (d) => d['Subcategory']);
        const xMax = d3.max(data, (d) => d['Subcategory']);

        const colorMin = d3.min(data, (d) => d['Profit Percentage']);
        const colorMax = d3.max(data, (d) => d['Profit Percentage']);

        console.log(yMin, yMax, xMin, xMax, colorMin, colorMax);

        const colorScale = d3
            .scaleLinear()
            .domain([colorMin, colorMax])
            .range(['#BA1D53', '#FF0540'])
            .clamp(true);
            
        const svg = d3
            .select('#bar-viz')
            .append('svg')
            .attr('width', this.props.width + margin.left + margin.right)
            .attr('height', this.props.height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
        
        // X axis code
        const xScale = d3
            .scaleBand()
            .domain(data.map((d) => { return d['Subcategory']; }))
            .range([0, this.props.width])
            .padding(0.2);
        
        svg
            .append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${this.props.height})`)
            .call(
                d3.axisBottom(xScale)
            )
            .selectAll('text')
                .attr('class', 'bar-text')
                .attr('transform', 'translate(-25, 35)rotate(-45)')
                .attr("fill", "#ffffff")
                .attr('text-align', 'right')
                .attr('font-size', '1rem')
                .style('test-anchor', 'end');
        
        // Y axis code
        
        const yScale = d3
            .scaleLinear()
            .domain([0, yMax])
            .range([this.props.height, 0]);
        
        svg
            .append('g')
            .attr('class', 'bar-text')
            .call(
                d3.axisLeft(yScale)
            );

        const tooltip = d3.select('#bar-viz').append('div')
            .attr('class', 'bar-tooltip')
            .style('opacity', 0)

        // Bar code

        svg
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
                .attr('x', (d) => { return xScale(d['Subcategory']); })
                .attr('width', xScale.bandwidth())
                .attr('fill', (d) => { return colorScale(d['Profit Percentage']); })
                .attr('height', (d) => { return this.props.height - yScale(0); })
                .attr('y', (d) => { return yScale(0); })
        
        // Animation
        svg
            .selectAll('rect')
            .transition()
            .duration(1000)
            .attr('y', (d) => { return yScale(d['Sales Percentage']); })
            .attr('height', (d) => { return this.props.height - yScale(d['Sales Percentage']); })
        
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

        


        
    }

    render() {
        return (
            <div id="bar-viz-wrapper" className="viz-module">
                <h2 className="module-header">Segmented Profit by Subcategory</h2>
                <div className="selectors">
                    <FormControlLabel control={<Checkbox defaultChecked onChange={this.toggleConsumer} checked={this.state.consumerSelected} disabled={this.state.allSelected} />} label="Consumer" />
                    <FormControlLabel control={<Checkbox onChange={this.toggleCorporate} checked={this.state.corporateSelected} disabled={this.state.allSelected} />} label="Corporate" />
                    <FormControlLabel control={<Checkbox onChange={this.toggleHome} checked={this.state.homeSelected} disabled={this.state.allSelected} />} label="Home Office" />
                    <FormControlLabel control={<Checkbox onChange={this.toggleAll} checked={this.state.allSelected}/>} label="All" />
                </div>
                <div id="bar-viz">

                </div>
            </div>
        );
        
    }
}

export default BarGraph;