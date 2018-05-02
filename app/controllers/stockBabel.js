"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var ReactDOM = require("react-dom");
var mainUrl = "https://secure-scrubland-29764.herokuapp.com";
var ws = new WebSocket("wss://secure-scrubland-29764.herokuapp.com/chart");
var chart = "";

var Stock = function (_React$Component) {
	_inherits(Stock, _React$Component);

	function Stock() {
		_classCallCheck(this, Stock);

		return _possibleConstructorReturn(this, (Stock.__proto__ || Object.getPrototypeOf(Stock)).apply(this, arguments));
	}

	_createClass(Stock, [{
		key: "render",
		value: function render() {
			var _this2 = this;

			return React.createElement(
				"div",
				{ className: "stock-div", style: { "backgroundColor": this.props.color }, onClick: function onClick(e) {
						return _this2.props.click(e, _this2.props.symbol);
					} },
				React.createElement(
					"p",
					{ className: "stock-text" },
					this.props.symbol
				)
			);
		}
	}]);

	return Stock;
}(React.Component);

var Main = function (_React$Component2) {
	_inherits(Main, _React$Component2);

	function Main() {
		_classCallCheck(this, Main);

		var _this3 = _possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).call(this));

		_this3.state = { chartData: null, selected: null, chart: null };
		_this3.canvas = React.createRef();
		_this3.changeSearch = _this3.changeSearch.bind(_this3);
		_this3.submitSearch = _this3.submitSearch.bind(_this3);
		_this3.getCharts = _this3.getCharts.bind(_this3);
		_this3.keyDown = _this3.keyDown.bind(_this3);
		_this3.stockClick = _this3.stockClick.bind(_this3);
		return _this3;
	}

	_createClass(Main, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			var _this4 = this;

			this.setState({ canvas: this.canvas.current.getContext("2d") });

			ws.onopen = function () {
				return _this4.getCharts();
			};

			ws.onmessage = function () {
				return _this4.getCharts();
			};
		}
	}, {
		key: "getCharts",
		value: function getCharts() {
			var _this5 = this;

			fetch(mainUrl + "/getChart").then(function (response) {
				return response.json();
			}).then(function (data) {

				if (data) {
					var dMap = data.stocks.map(function (v) {
						return {
							label: v.stockName,
							data: v.data,
							borderColor: v.color,
							backgroundColor: v.color,
							fill: false
						};
					});

					if (_this5.state.chart) {
						_this5.setState({ chartData: dMap, selected: null, search: "" });
						chart.config.data = dMap;
						return chart.update();
					} else {
						chart = createGraph(_this5.state.canvas, data.dateLabelArray, dMap);
						return _this5.setState({ chartData: dMap, chart: true, selected: null, search: "" });
					}
				} else {
					if (_this5.state.chart) {
						chart.destroy();
						chart = "";
					}
					return _this5.setState({ chart: null, chartData: null, selected: null, search: "" });
				}
			});
		}
	}, {
		key: "changeSearch",
		value: function changeSearch(e) {
			this.setState({ search: e.target.value });
		}
	}, {
		key: "submitSearch",
		value: function submitSearch(e) {
			e.preventDefault();
			fetch(mainUrl + "/addToStock/" + this.state.search, { method: "POST", credentials: "include" }).then(function (response) {
				return response.json();
			}).then(function (data) {
				if (data.error) return alert(data.error);
				ws.send("added stock");
			});
		}
	}, {
		key: "submitDelete",
		value: function submitDelete(symbol) {
			fetch(mainUrl + "/deleteStock/" + symbol, { method: "DELETE", credentials: "include" }).then(function (response) {
				return response.json();
			}).then(function (data) {
				if (data.error) return alert(data.error);
				ws.send("deleted stock");
			});
		}
	}, {
		key: "stockClick",
		value: function stockClick(e, symbol) {
			var val = symbol === this.state.selected ? null : symbol;
			val ? chart.config.data = this.state.chartData.filter(function (v) {
				return v.label === val;
			}) : chart.config.data = this.state.chartData;
			chart.update();
			this.setState({ selected: val });
		}
	}, {
		key: "keyDown",
		value: function keyDown(e) {
			if (e.keyCode === 46 && this.state.selected) return this.submitDelete(this.state.selected);
		}
	}, {
		key: "render",
		value: function render() {
			var _this6 = this;

			var stockArray = null;
			if (this.state.chartData) stockArray = this.state.chartData.map(function (v) {
				return React.createElement(Stock, { key: v.label, color: v.borderColor, symbol: v.label, click: _this6.stockClick });
			});
			var divFocus = this.state.selected ? true : false;

			return React.createElement(
				"div",
				{ className: "mainContainer", tabIndex: "0", onKeyDown: this.keyDown, autoFocus: divFocus },
				React.createElement(
					"div",
					{ className: "chart-container" },
					React.createElement("canvas", { ref: this.canvas })
				),
				React.createElement(
					"div",
					{ className: "bottomContainer" },
					React.createElement(
						"p",
						{ className: "instruction" },
						"\"Click a stock symbol to focus on a single stock. Press delete while a symbol is selected to delete that stock symbol.\""
					),
					React.createElement(
						"div",
						{ className: "stock-div-container" },
						stockArray
					)
				),
				React.createElement(
					"div",
					{ className: "searchContainer" },
					React.createElement(
						"form",
						{ onSubmit: this.submitSearch },
						React.createElement("input", { id: "SearchInput", value: this.state.search, placeholder: "Enter stock here", className: "searchbar", type: "text", onChange: this.changeSearch }),
						React.createElement("input", { src: "/public/images/magnifier.png", className: "searchLogo", alt: "search", type: "image" })
					)
				)
			);
		}
	}]);

	return Main;
}(React.Component);

ReactDOM.render(React.createElement(Main, null), document.getElementById("root"));
