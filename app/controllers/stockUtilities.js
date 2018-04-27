"use strict";

function createGraph(canvas, labels, data) {
	
	let options = {
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

	return new Chart(canvas, {
		type: 'line',
        data: {labels: labels, datasets: data},
        options: options
	});

}
