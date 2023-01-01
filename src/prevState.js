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
		this.state = {
			x: 0,
			y: 0
		};
		this.showSVG = this.showSVG.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
	}

	handleMouseMove(event){
		this.setState({
			x: event.ClientX,
			y: event.ClientY
		});
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
		let choropleth;
		let education;

		const drawMap = ()=>{
			//Define the height width and padding of the main svg
			const [w, h, padding] = [1000, 650, 10];
			const mainSvg = d3.select("#mainSvg").attr("height", h).attr("width", w);
	
			//Drawing the map
			const drawnMap = mainSvg.selectAll('path').data(choropleth).enter().append('path').attr('d', d3.geoPath()).attr('class', 'county')
			.attr('fill', (d)=>{
				let id = d.id;
				let county = education.find((instance)=>(instance.fips === id));
				let percentage = county.bachelorsOrHigher;
				if(percentage <= 10){
					return '#ee9b00';
				}else if(percentage <= 20){
					return '#ca6702';
				}else if(percentage <= 30){
					return '#bb3e03';
				}else{
					return '#ae2012';
				}
			});

			return drawnMap;
		};

		const toolTip = (area) => {
			area.on('mouseenter', ()=>{
				d3.select('#mainSvg').append('foreignObject').attr('width', 20).attr('height', 20).style('background-color', 'green').attr('id', 'tooltip');
			}).on('mouseout', ()=>(d3.select('#tooltip').remove()));
		};

		d3.json(url2).then(
			(data, error) => {
				if(error){
					console.log(error);
				}else{
					choropleth = topojson.feature(data, data.objects.counties).features;
					d3.json(url1).then(
						(data, error) => {
							if(error){
								console.log(error);
							}else{
								education = data;
								let location = drawMap();
								toolTip(location);
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
					<h6>this.state.x={this.state.x}||this.state.y={this.state.y} </h6>
					<h1 className="text" id="title">United States Educational Attainment</h1>
					<br />
					<h5 className="text" id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h5>
				</div>
				<div className="svgDiv">
					<svg id="mainSvg" onMouseMove={this.handleMouseMove}></svg>
				</div>
				<br />
				<p className='link'>Source: <a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx" target="_blank" style={{textDecoration: 'none'}}>USDA Economic Research Service</a> </p>
			</div>
		);
	}
};

export default Main;