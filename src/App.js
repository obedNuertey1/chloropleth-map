import React, { startTransition } from 'react';
import './style.css';
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Card, Nav, Col, Row, Image} from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';
import thunk from 'redux-thunk';
import {PropTypes} from 'prop-types';
import * as d3 from 'd3';
import { timeMinute } from 'd3';
import { timeFormat } from 'd3-time-format';
import * as topojson from 'topojson';


class Main extends React.Component{
	constructor(props){
		super(props);
		this.showSVG = this.showSVG.bind(this);
	}

	shouldComponentUpdate(nextState, nextProps){
		return true;
	}

	componentWillMount(){
		$('body').addClass('backgroundColor');
	}
	componentWillUnmount(){
		document.removeEventListener('DOMContentLoaded', this.showSVG());
	}
	componentDidMount(){
		document.addEventListener('DOMContentLoaded', this.showSVG());
	}

	showSVG(){
		//initializing new xmlhttprequest for education
		const [url1, url2] = ['https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json', 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'];

		//These variables will contain info from the Retrieved API
		let [choropleth, education] = [undefined, undefined];

		//Defining Map Colors
		const [color1, color2, color3, color4] = ['#ee9b00',  '#ca6702', '#bb3e03', '#ae2012' ];

		//Create the legend
		const legend = (svg) =>{
			const [w, h, padding] = [350, 25, 20];
			const mainSvg = svg.append('foreignObject').attr('width', w).attr('height', h).attr('x', 540).append('svg').attr('id', 'legend').attr('width', w).attr('height', h);

			//Define a scale for the
			let legendData = [0, 10, 20, 30, 40, 50, 60, 70, 80];
			const [xScale, yScale] = [
				d3.scaleLinear().range([padding, w - padding]).domain(d3.extent(education, (d)=>(d.bachelorsOrHigher))).nice(),
				d3.scaleLinear().range([h - padding, 0]).domain([0, 5])
			];

			//Define the x and y axes
			const formatPercent = d3.format('.0%');
			const format = (d) => (formatPercent(d/100))

			const [xAxis, yAxis] = [
				d3.axisBottom(xScale).tickFormat(format).ticks(5)
				//.tickValues(d3.range(0, Math.ceil(xScale.domain()[1] / 15) * 15 + 1, 15))
				.tickValues(d3.range(0, Math.ceil(xScale.domain()[1] / 10) * 10 + 1, 10))
				,
				d3.axisLeft(yScale)
			];

			//Create the axes
			mainSvg.append('g').attr('transform', `translate(0, ${h-padding})`).call(xAxis);

			//Create Rect Elements for the legend
			legendData = [10, 20, 30, 40, 50, 60, 70, 80]
			mainSvg.selectAll('rect').data(legendData).enter().append('rect').attr('height', yScale(-5)-yScale(4)).attr('width', xScale(5.7)).attr('y', yScale(d=>d)).attr('x', (d, i)=>(xScale(i*legendData.length) + i*7.8)).attr('fill', (d)=>((d <= 10)?(color1):(d <= 20)?(color2):(d <= 30)?(color3):(color4))).attr('stroke-width', '1px').attr('stroke', 'black')
		};

		const mainSvg = () => {
			//Define the height width and padding of the main svg
			const [w, h, padding] = [1000, 650, 10];
			const mainSvg = d3.select("#mainSvg").attr("height", h).attr("width", w);
			return mainSvg;
		};

		const drawMap = (mainSvg)=>{
			//Drawing the map
			const drawnMap = mainSvg.selectAll('path').data(choropleth).enter().append('path').attr('d', d3.geoPath()).attr('class', 'county')
			.attr('fill', (d)=>{
				let id = d.id;
				let county = education.find((instance)=>(instance.fips === id));
				let percentage = county.bachelorsOrHigher;
				if(percentage <= 10){
					return color1;
				}else if(percentage <= 20){
					return color2;
				}else if(percentage <= 30){
					return color3;
				}else{
					return color4;
				}
			}).attr('data-fips', (d)=>{
				let id = d.id;
				let county = education.find((instance)=>(instance.fips === id));
				return county.fips;
			}).attr('data-education', (d)=>{
				let id = d.id;
				let county = education.find((instance)=>(instance.fips === id));
				return county.bachelorsOrHigher;
			});

			return drawnMap;
		};

		const toolTip = (area) => {
			area.on('mouseenter', (i, d)=>{
				let id = d.id;
				let county = education.find((instance)=>(instance.fips === id));
				let [areaName, state, percentage] = [county.area_name, county.state, county.bachelorsOrHigher];
				const [x, y] = [parseInt(d.geometry.coordinates[0][d.geometry.coordinates[0].length-1][0]), parseInt(d.geometry.coordinates[0][d.geometry.coordinates[0].length-1][1])];
				d3.select('#mainSvg')
				.append('foreignObject').style('z-index', "5").style('position', 'absolute')
				.attr('width', 250).attr('height', 40).attr('id', 'tooltip')
				.attr('data-education', percentage).attr('x', x-100).attr('y', y-20).append('xhtml:div').attr('class', 'tooltipDiv').html(`${areaName}, ${state}: ${percentage}%`);
			}).on('mouseout', ()=>(d3.select('#tooltip').remove()));
		};

		d3.json(url2).then(
			(data, error) => {
				if(error){
					console.log(error);
				}else{
					choropleth = topojson.feature(data, data.objects.counties).features;
					console.log(JSON.stringify(choropleth[0].geometry.coordinates[0][0]))
					d3.json(url1).then(
						(data, error) => {
							if(error){
								console.log(error);
							}else{
								education = data;
								const svg = mainSvg();
								let location = drawMap(svg);
								toolTip(location);
								legend(svg);
							}
						}
					)
				}
			}
		);

	}


	render(){
		return(
			<div className="wrapperContainer">
				<div className="text-div">
					<h1 className="text" id="title">United States Educational Attainment</h1>
					<br />
					<h5 className="text" id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h5>
				</div>
				<div className="svgDiv">
					<svg id="mainSvg" ></svg>
				</div>
				<br />
				<p className='link'>Source: <a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx" target="_blank" style={{textDecoration: 'none'}}>USDA Economic Research Service</a> </p>
			</div>
		);
	}
};

export default Main;