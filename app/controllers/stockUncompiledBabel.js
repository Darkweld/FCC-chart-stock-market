var React = require("react");
var ReactDOM = require("react-dom");
var mainUrl = "https://secure-scrubland-29764.herokuapp.com/";

class Stock extends React.Component {
	render() {
		
		return(
		<div className = "stock-div" draggable = "true">
			<p className = "stock-text">{this.props.stockName}</p>
		</div>
		);
	}
}

class Main extends React.Component {
	constructor() {
		super();
		
		this.state = {stocks: []};
		this.canvas = React.createRef();
		this.changeSearch = this.changeSearch.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
		this.getCharts = this.getCharts.bind(this);
	}
	
	componentDidMount() {
		let canvas = ReactDOM.findDOMNode(this.refs.canvas).getContext("2d");
		this.getCharts();
	}
	
	getCharts() {
		
		fetch("https://secure-scrubland-29764.herokuapp.com/getChart")
		.then(response => response.json())
		.then(data => {
		
		let map = (data) ?  data.stocks.map(v => ({
                    label: v.stockName,
                    data: v.data,
                    borderColor: v.color,
                    backgroundColor: v.color,
                    fill: false
		})) : null;
		
		return this.setState({chartLabels : data.dateLabelArray, chartData: map});
		
		});
		
	}
	
	changeSearch() {
		
	}
	
	submitSearch() {
		
	}
	
	render() {
		let stockArray = (this.state)
		
		
		
		
	return (
	<div className = "mainContainer">
		<div className = "chart-container">
			<canvas ref = {this.canvas} ></canvas>
		</div>
		<div className = "bottomContainer">
			<p className = "instruction">"Drag elements ouside of the red border to delete them from the chart. Otherwise click them to focus on a single stock."</p>
			<div className = "stock-div-container">
				{stockArray}
			</div>
		</div>
		<div className = "searchContainer">
			<form onSubmit = {this.submitSearch}>
			<input id="SearchInput" placeholder="enter stock here" className = "searchbar" type="text" onChange = {this.changeSearch}></input>
			<input src = "/public/images/magnifier.png" className = "searchLogo" alt = "search" type = "image"></input>
			</form>
		</div>
	</div>
	);	
	}
	
}



ReactDOM.render(<Main />, document.getElementById("root"));
