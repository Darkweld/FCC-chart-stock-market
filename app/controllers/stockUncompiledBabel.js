var React = require("react");
var ReactDOM = require("react-dom");
const mainUrl = "https://secure-scrubland-29764.herokuapp.com";
var ws = new WebSocket("wss://secure-scrubland-29764.herokuapp.com/chart");



class Stock extends React.Component {
	render() {
		
		return(
		<div className = "stock-div" draggable = "true" onClick = {e => this.props.click(e, this.props.symbol)}>
			<p className = "stock-text">{this.props.symbol}</p>
		</div>
		);
	}
}

class Main extends React.Component {
	constructor() {
		super();
		
		this.state = {chartLabels: null, chartData: null, selection: null};
		this.canvas = React.createRef();
		this.changeSearch = this.changeSearch.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
		this.getCharts = this.getCharts.bind(this);
		this.keyDown = this.keyDown.bind(this);
	}
	
	componentDidMount() {
		this.setState({canvas : this.canvas.current.getContext("2d")});
		
		ws.onopen = () => this.getCharts();
		
		ws.onmessage = () => this.getCharts();
		
	}
	
	getCharts() {
		
		fetch(mainUrl + "/getChart")
		.then(response => response.json())
		.then(data => {
		
		
		if (data) {
		let dMap = data.stocks.map(v => ({
            label: v.stockName,
            data: v.data,
            borderColor: v.color,
            backgroundColor: v.color,
            fill: false
		}));
		
		if (this.state.chart) {
				this.setState({chartLabels: data.dateLabelArray, chartData: dMap, selected: null, search: ""});
				return this.state.chart.update();
			} else {
				let chart = createGraph(this.state.canvas, data.dateLabelArray, map);
				return this.setState({chartLabels : chart.data.labels, chartData: chart.data.datasets, chart: chart, selected: null, search: ""});
			}
		
		} else {
			if (this.state.chart) this.state.chart.destroy();
			return this.setState({chart: null, chartLabels: null, chartData: null, selected: null, search: ""});
		}
	});
		
	}
	
	changeSearch(e) {
		this.setState({search: e.target.value})
	}
	
	submitSearch(e) {
		fetch(mainUrl + "/addToStock/" + this.state.search, {method: "POST", credentials: "include"})
		.then(response => response.json())
		.then(data => {
			if (data.error) return alert(data.error);
			ws.send("added stock");
		});
	}
	
	submitDelete(symbol) {
		fetch(mainUrl + "/deleteStock/" + symbol, {method: "POST", credentials: "include"})
		.then(response => response.json())
		.then(data => {
			if (data.error) return alert(data.error);
			ws.send("deleted stock");
		});
	}
	
	stockClick(e, symbol) {
		let val = (symbol === this.state.selected) ? null : symbol;
		this.setState({selected: val});
	}
	
	keyDown(e) {	
		if (e.key === 46 && this.state.selected) return submitDelete(symbol);
	}
	
	render() {
	let stockArray = null;
	if (this.state.chartData) stockArray = this.state.chartData.map(v => {
	<Stock key = {v.stockName} symbol = {v.stockName} click = {this.stockClick}/>
	});
	let divFocus = (this.state.selected) ? true : false;
	
	
	return (
	<div className = "mainContainer" tabIndex="0" onKeyDown = {this.keyDown} autoFocus = {divFocus}>
		<div className = "chart-container">
			<canvas ref = {this.canvas}></canvas>
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
