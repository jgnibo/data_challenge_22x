import React, { Component, useCallback } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import { enableAllPlugins, produce } from 'immer';
import * as d3 from 'd3';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import states from './../us-states.json'
import sales_2014 from './../notebooks/sales_2014.csv';
import sales_2015 from './../notebooks/sales_2015.csv';
import sales_2016 from './../notebooks/sales_2016.csv';
import sales_2017 from './../notebooks/sales_2017.csv';

import './map.css';


import './bar.css';

enableAllPlugins();

class Map extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            data: {
                sales_2014: {},
                sales_2015: {},
                sales_2016: {},
                sales_2017: {}
            },
            workingData: null
        }
    }

    componentDidMount() {
        this.parseData(sales_2014, 'sales_2014');
        this.parseData(sales_2015, 'sales_2015');
        this.parseData(sales_2016, 'sales_2016');
        this.parseData(sales_2017, 'sales_2017');
        this.createChart();
        console.log(states);

    }

    parseData(data, year) {
        d3.csv(data).then((data) => {
            const newData = data.map((d) => {
                return {
                    'State': d['State'],
                    'Sales': parseFloat(d['Sales'])
                }
            })
            const geoJSON = JSON.parse(JSON.stringify(states));
            Object.keys(newData).forEach((key) => {
                Object.keys(geoJSON.features).every((jsonKey) => {
                    if (newData[key]['State'] === geoJSON.features[jsonKey].properties.name) {
                        geoJSON.features[jsonKey].properties['Sales'] = newData[key]['Sales'];
                        return false;
                    }
                    return true;
                })
            });
            this.setState(
                produce((draft) => {
                    draft.data[year] = geoJSON;
                    if(year === 'sales_2014') {
                        draft.workingData = geoJSON;
                    }
                })
            );
        }).catch((err) => {
            console.log('error', err)
        });
    }


    createChart = () => {

        const svg = d3
            .select('#map-viz')
            .append('svg')
            .attr('width', this.props.width)
            .attr('height', this.props.height)
        
        const tooltip = d3
            .select('#map-viz')
            .append('div')
            .attr('class', 'map-tooltip')
            .style('opacity', 0)

    }

    updateChart(data) {
        console.log("data", data);
        const colorMin = d3.min(data.features, (d) => d.properties['Sales']);
        const colorMax = d3.max(data.features, (d) => d.properties['Sales']);

        console.log(colorMin, colorMax);

        const colorScale = d3
            .scaleSqrt()
            .domain([colorMin, colorMax])
            .range(['#ffffff', '#0b903f'])

        const projection = d3.geoAlbersUsa()
            .translate([this.props.width / 2, this.props.height / 2])
            .scale([1000]);

        const path = d3.geoPath().projection(projection)

        const svg = d3
            .select('#map-viz')
            .select('svg')
        
        var map = svg
            .selectAll('path')
            .data(data.features)

        map
            .enter()
            .append('path')
                .attr('d', path)
                .style('stroke', '#000000')
                .style('stroke-width', '0.5')
                .attr('fill', (d) => {
                    if (!colorScale(d.properties['Sales'])) {
                        return '#ffffff';
                    }
                    return colorScale(d.properties['Sales']);
                })
        
        svg
            .selectAll('path')
            .transition()
            .duration(1000)
            .attr('fill', (d) => {
                if (!colorScale(d.properties['Sales'])) {
                    return '#ffffff';
                }
                return colorScale(d.properties['Sales']);
            })
        

        const tooltip = d3
            .select('.map-tooltip')

        svg
            .selectAll('path')
            .on('mouseover', (d) => {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1)
            })
            .on('mousemove', (event, d) => {
                console.log('D HERE', d);
                console.log(event.pageX, event.pageY);
                tooltip
                    .style('left', event.pageX - 75 + 'px')
                    .style('top', event.pageY - 85 + 'px')
                    .html(this.tooltipText(d.properties));
            })
            .on('mouseout', () => {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            })

        
        map
            .exit()
            .remove()
    }

    tooltipText(properties) {
        if (properties['Sales']) {
            return (
                `<div>
                    <div>
                        <span class="tooltip-title">State: </span>
                        <span class="tooltip-desc">${properties.name}</span>
                    </div>
                    <div>
                        <span class="tooltip-title">Sales: </span>
                        <span class="tooltip-desc">$${properties['Sales'].toFixed(2)}</span>
                    </div>
                </div>`
            );
        } else {
            return (
                `<div>
                    <div>
                        <span class="tooltip-title">State:</span>
                        <span class="tooltip-desc">${properties.name}</span>
                    </div>
                    <div>
                        <span class="tooltip-title">Sales:</span>
                        <span class="tooltip-desc">$0</span>
                    </div>
                </div>`
            )
        }
    }

    optionClicked = (event) => {
        if (event.target.value === 'sales_2014') {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.sales_2014;
                }),
            );
        } else if (event.target.value === 'sales_2015') {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.sales_2015;
                }),
            );
        } else if (event.target.value === 'sales_2016') {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.sales_2016;
                }),
            );
        } else if (event.target.value === 'sales_2017') {
            this.setState(
                produce((draft) => {
                    draft.workingData = draft.data.sales_2017;
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
            <div id="map-viz-wrapper" className="viz-module">
                <h2 className="module-header">Yearly Sales by State</h2>
                <div className="selectors">
                    <RadioGroup onChange={this.optionClicked} row aria-labelledby="demo-radio-buttons-group-label" defaultValue="sales_2014" name="map-radios">
                        <FormControlLabel value="sales_2014" control={<Radio />} label="2014" />
                        <FormControlLabel value="sales_2015" control={<Radio />} label="2015" />
                        <FormControlLabel value="sales_2016" control={<Radio />} label="2016" />
                        <FormControlLabel value="sales_2017" control={<Radio />} label="2017" />
                    </RadioGroup>
                </div>
                {this.renderGraph()}
                <div id="map-viz"></div>
                <div className="viz-description">
                    <p>This map shows yearly total sales by state. Map coloring is scaled relative to the max sales value out of all the states for the selected year. The darker the hue, the greater the percentage of sales for that state is compared to the aforementioned maximum sales value. Toggle through the years to see how sales changed over time, and hover over a state to see the total sales value for that year.</p>
                </div>
            </div>
        );
    }
}

export default Map;