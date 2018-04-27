var React = require("react");
var ReactDOM = require("react-dom");
const mainUrl = "https://secure-scrubland-29764.herokuapp.com/";
var ws = new WebSocket('wss://stock-market-darkweld.c9users.io/chart');

class Stock extends React.Component {
	render() {
		
		return(
		<div className = "stock-div" draggable = "true">
			<p className = "stock-text">{this.props.symbol}</p>
		</div>
		);
	}
}

class Main extends React.Component {
	constructor() {
		super();
		
		this.state = {chartLabels: "", chartData: null};
		this.canvas = React.createRef();
		this.changeSearch = this.changeSearch.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
		this.getCharts = this.getCharts.bind(this);
	}
	
	componentDidMount() {
		this.setState({canvas : ReactDOM.findDOMNode(this.refs.canvas).getContext("2d")});
		
		ws.onopen = () => this.getCharts();
		
		ws.onmessage = () => this.getCharts();
		
	}
	
	getCharts() {
		
		fetch(mainUrl)
		.then(response => response.json())
		.then(data => {
		
		let map = (data) ?  data.stocks.map(v => ({
                    label: v.stockName,
                    data: v.data,
                    borderColor: v.color,
                    backgroundColor: v.color,
                    fill: false
		})) : null;
		
		if (this.state.chart) {
			(map) ? this.state.chart.update() : this.state.chart.destroy();
			return this.setState({chartLabels : data.dateLabelArray, chartData: map});
		} else {
			return this.setState({chartLabels : data.dateLabelArray, chartData: map, 
			chart: createGraph(this.state.canvas, this.state.chartLabels, this.state.chartData)});
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
		}
	}
	
	submitDelete(symbol) {
		fetch(mainUrl + "/deleteStock/" + symbol, {method: "POST", credentials: "include"})
		.then(response => response.json())
		.then(data => {
			if (data.error) return alert(data.error);
			ws.send("deleted stock");
		}
	}
	
	stockClick(e, symbol) {
		this.setState({selected: symbol});
	}
	
	keyDown(e, symbol) {
		/* key for delete is 46 */
		
		if (e.keyCode === 46) return submitDelete(symbol);
		
		
	}
	
	
	/////////////////////////////////////////////////////////////////
	/*pressing delete while having a stock selected will delete it.*/
	/////////////////////////////////////////////////////////////////
	
	render() {
	let stockArray = null;
	if (this.state.chartData) stockArray = this.state.chartData.map(v => <Stock key = {v.stockName} symbol = {v.stockName} />);
		
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
