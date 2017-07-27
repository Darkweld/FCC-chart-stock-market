'use strict';

(function() {

    var canvas = document.getElementById('Chart').getContext('2d');
    var container = document.getElementById('stock-div-container');
    var loading = document.getElementById('loading');
    var searchContainer = document.getElementById('searchContainer');
    var socket = new WebSocket('wss://stock-market-darkweld.c9users.io/chart');
    var lineChart = "";
    var chartData = {
               labels: "",
               datasets: []
            };
    var storedArr = [];
    var filterArr = [];
            
     function containerText () {
           var text = document.createElement('p');
           var textText = document.createTextNode("Enter a stock symbol below to begin");
           text.appendChild(textText);
           text.className = "noStock";
           container.appendChild(text);
     }       
    
    
    function colorRandomizer () {
        var str = "";
        for (var i = 0; i < 3; i++) {
            str += Math.round(Math.random() * 255) + ", "; 
        }
        str = "rgba(" + str + "1)";
        return str;
    }
    
    var options = {
    resposive: true,
    elements: {
        point: {
            radius: 0
        }
    },
    title: {
        display: true,
        text: 'Stock Values Over Time'
    },
    tooltips: {
        position: 'average',
        mode: 'index',
        intersect: false
    },
    scales: {
        xAxes: [{
            type: 'time',
            time: {
                format: "YYYY-MM-DD",
            },
            ticks: {
              maxRotation: 0,
            },
            gridLines: {
                drawOnChartArea: false,
                color: 'rgba(255,255,255,1)'
            },
            scaleLabel: {
                display: true,
                labelString: 'Date'
            }
        }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'Value'
            },
            gridLines: {
                color: 'rgba(255,255,255,1)'
            }
        }]
    }
};
    
        function create() {
            
            lineChart = new Chart(canvas, {
                type: 'line',
                data: chartData,
                options: options
            });
          
}
            
            
    function addStockDivs(arr) {
        container.innerHTML = '';
        
        
        if (!arr.length) {
            
           containerText();
           searchContainer.classList.remove('displayNone');
           loading.classList.add('displayNone');
           return;
        }
        
        
       for (var i = 0, l = arr.length; i < l; i++) {
           
           var div = document.createElement('div');
           div.className = "stock-div";
           div.draggable = true;
           div.ondragover = function(event) { event.stopPropagation(); };
           div.id = arr[i].label;
           
           var text = document.createElement('p');
           var textText = document.createTextNode(arr[i].label);
           text.appendChild(textText);
           div.appendChild(text);
           text.className = "stock-text";
           
           
           
           (function(div, stock) {
              
              div.addEventListener('dragstart', function(event) {
                     
                     event.dataTransfer.setData('text', div.id);
                      
                      }, false);
                
                div.addEventListener('click', function(event) {
                    if (!storedArr.length) storedArr = chartData.datasets;
                    
                    if (chartData.datasets.length === 1 && chartData.datasets[0].label === div.id) { chartData.datasets = storedArr; }
                    
                    else {
                        
                        for (i = 0, l = storedArr.length; i < l; i++) {
                            if (storedArr[i].label === div.id) {
                                chartData.datasets = [storedArr[i]];
                                
                                
                            }
                        
                        }
                    }
                    
                    return lineChart.update();
                    
                    
                      }, false);
              
               
           })(div, arr[i].label);
           
           container.appendChild(div);
       }
       
                      searchContainer.classList.remove('displayNone');
                      loading.classList.add('displayNone');
    }
    
    
    socket.onopen = function() {
        searchContainer.classList.add('displayNone');
         loading.classList.remove('displayNone');
        
         xhttp.request('GET', mainUrl + '/getChart', function(data) {
            data = JSON.parse(data);
             if (!data || !data.stocks.length) {
            searchContainer.classList.remove('displayNone');
            loading.classList.add('displayNone');
             containerText();
             
          return;
          
      }
      
      
      chartData.labels = data.dateLabelArray;
      for (var i = 0, l = data.stocks.length; i < l; i++) {
                var color = colorRandomizer();
                chartData.datasets.push({
                    label: data.stocks[i].stockName,
                    data: data.stocks[i].data,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false
                });
            }

       create();
       addStockDivs(chartData.datasets);
       
    });
    };
            
    socket.onmessage = function(event) {
     
     searchContainer.classList.add('displayNone');
     loading.classList.remove('displayNone');
     
     xhttp.request('GET', mainUrl + '/getChart', function(data) {
            data = JSON.parse(data);
            
        if (!data.stocks.length) {
            lineChart.destroy();
            lineChart = "";
            containerText();
            searchContainer.classList.remove('displayNone');
            loading.classList.add('displayNone');
            return;
        }
        
        
    chartData.datasets = [];
        
      chartData.labels = data.dateLabelArray;  
      for (var i = 0, l = data.stocks.length; i < l; i++) {
          var color = colorRandomizer();
                chartData.datasets.push({
                    
                    label: data.stocks[i].stockName,
                    data: data.stocks[i].data,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false
                });
            }
            
       storedArr = [];
        
       (lineChart) ? lineChart.update() : create();
       addStockDivs(chartData.datasets);
     
     
     });
        
         
     };

    
    document.getElementById('Search').addEventListener('submit', function(event) {
            event.preventDefault();
            searchContainer.classList.add('displayNone');
            loading.classList.remove('displayNone');
            
            xhttp.request('POST', mainUrl + '/addToStock/' + document.getElementById('SearchInput').value, function(stockData){
                stockData = JSON.parse(stockData);
                if (stockData.error) {
                    searchContainer.classList.remove('displayNone');
                    loading.classList.add('displayNone');
                    document.getElementById('errors').classList.remove('displayNone');
                    document.getElementById('errors').innerHTML = stockData.error;
                    
                    return;
                }
                document.getElementById('errors').classList.add('displayNone');
                document.getElementById('SearchInput').value = "";
                socket.send('add');
                
            });
    
    }, false);
    
    document.addEventListener("dragover", function( event ) {
      event.preventDefault();
        }, false);
    
    document.addEventListener('drop', function(event) {
                     event.preventDefault();
                     if (event.target !== container) {
                         var data = event.dataTransfer.getData("text");
                          xhttp.request('DELETE', mainUrl + '/deleteStock/' + data, function() {  
                                
                                container.removeChild(document.getElementById(data));
                                
                                return socket.send('delete');
                          });
                     }
                     
                  }, false);
    
})();