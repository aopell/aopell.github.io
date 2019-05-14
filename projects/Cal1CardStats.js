function initialize() {
    let script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@2.8.0/dist/Chart.min.js";
    script.onload = processData;
    document.head.appendChild(script);
    let style = document.createElement("style");
    style.textContent = `
    body {
        font-family: sans-serif;
    }

    /*canvas {
        max-width: 1000px;
        max-height: 500px;
    }*/

    h1 {
        margin-top: 0;
    }

    #container div {
        display: block;
        border: 1px solid black;
        padding: 20px;
        margin: 10px;
    }
    `;
    document.head.appendChild(style);
}

function loadData() {
    try {
        debitTransactions = [];
        mealSwipeTransactions = [];
        flexTransactions = [];
        mealPlanType = "Meal Plan";

        let table = document.querySelector("#content_window > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody") || document.querySelector("body > div > div.container.clearfix > div > div > div > div.col3 > div > table > tbody");
        let section = 0;

        for (let row of table.children) {
            switch (section) {
                case 0:
                    if (row.textContent.match("Debit")) {
                        section = 1;
                    }
                    break;
                case 1:
                    if (row.textContent.match("Meal")) {
                        section = 2;
                        mealPlanType = row.textContent.replace(" Activity", "");
                        break;
                    }
                    if (row.firstElementChild.tagName == "TH") break;
                    try {
                        debitTransactions.push({
                            date: new Date(Date.parse(row.children[0].textContent)),
                            amount: (() => {
                                let result = row.children[1].textContent.match(/(\(?)\$(\d+\.\d\d)/);
                                return (result[2] * (result[1] ? 1 : -1)).toFixed(2);
                            })(),
                            balance: row.children[2].textContent.match(/(\(?)\$(\d+\.\d\d)/)[2],
                            location: clean(row.children[3].textContent)
                        });
                    } catch (e) { console.warn("Caught error: %o", e) }
                    break;
                case 2:
                    if (row.textContent.match("Flex")) {
                        section = 3;
                        break;
                    }
                    if (row.firstElementChild.tagName == "TH") break;
                    try {
                        mealSwipeTransactions.push({
                            date: new Date(Date.parse(row.children[0].textContent)),
                            swipes: +row.children[1].textContent,
                            location: clean(row.children[3].textContent)
                        });
                    } catch (e) { console.warn("Caught error: %o", e) }
                    break;
                case 3:
                    if (row.firstElementChild.tagName == "TH") break;
                    try {
                        flexTransactions.push({
                            date: new Date(Date.parse(row.children[0].textContent)),
                            amount: (() => {
                                let result = row.children[1].textContent.match(/(\(?)\$(\d+\.\d\d)/);
                                return (result[2] * (result[1] ? 1 : -1)).toFixed(2);
                            })(),
                            balance: row.children[2].textContent.match(/(\(?)\$(\d+\.\d\d)/)[2],
                            location: clean(row.children[3].textContent)
                        });
                    } catch (e) { console.warn("Caught error: %o", e) }
                    break;
            }
        }

        return {
            mealSwipeTransactions,
            flexTransactions,
            debitTransactions
        };
    }
    catch (ex) {
        console.error(ex);
    }
}

let now = getWeekDetails(new Date());

function createWeeklyData(transactions, labelProp, valueProp) {
    let sorted = transactions.sort((a, b) => a.date > b.date ? 1 : -1);
    console.log(sorted);
    let weekLabels = new Set();
    let data = {};
    for (let tran of sorted) {
        if (!(tran[labelProp] in data)) {
            data[tran[labelProp]] = {};
        }

        let week = getWeekDetails(tran.date);
        weekLabels.add(week.description);

        if (week.description in data[tran[labelProp]]) {
            data[tran[labelProp]][week.description] += Math.abs(+tran[valueProp]);
        } else {
            data[tran[labelProp]][week.description] = Math.abs(+tran[valueProp]);
        }
    }
    return { data, weekLabels: Array.from(weekLabels) };
}

function makeDatasetsFromWeeklyData(elem, weeklyData) {
    let ds = [];
    for (let loc in weeklyData.data) {
        ds.push({
            data: weeklyData.weekLabels.map(week => weeklyData.data[loc][week] || 0),
            label: loc,
            backgroundColor: ctx => chartColor(ctx.chart.id % 3, ctx.datasetIndex),
            hoverBackgroundColor: ctx => chartColor(ctx.chart.id % 3, ctx.datasetIndex)
        });
    }

    return {
        datasets: ds,
        labels: weeklyData.weekLabels,
        elem,
        type: "bar"
    };
}

function processData() {
    let data = loadData();
    let chartData = {};

    chartData.mealsPie = createChartDataFromDictionary("meal-swipes-pie-chart", "pie", createDictionaryFromDataset(data.mealSwipeTransactions, "location", "swipes"));
    chartData.flexPie = createChartDataFromDictionary("flex-dollars-pie-chart", "pie", createDictionaryFromDataset(data.flexTransactions.filter(t => t.amount < 0), "location", "amount"));
    chartData.debitPie = createChartDataFromDictionary("debit-account-pie-chart", "pie", createDictionaryFromDataset(data.debitTransactions.filter(t => t.amount < 0), "location", "amount"))

    chartData.mealsBar = makeDatasetsFromWeeklyData("meal-swipes-bar-chart", createWeeklyData(data.mealSwipeTransactions, "location", "swipes"));
    chartData.flexBar = makeDatasetsFromWeeklyData("flex-dollars-bar-chart", createWeeklyData(data.flexTransactions.filter(t => t.amount < 0), "location", "amount"));
    chartData.debitBar = makeDatasetsFromWeeklyData("debit-account-bar-chart", createWeeklyData(data.debitTransactions.filter(t => t.amount < 0), "location", "amount"));

    displayData(data, chartData);
}

function createDictionaryFromDataset(dataset, labelProp, valueProp) {
    let dict = {};
    for (let data of dataset) {
        if (data[labelProp] in dict) {
            dict[data[labelProp]] += +data[valueProp];
        } else {
            dict[data[labelProp]] = +data[valueProp];
        }
    }
    return dict;
}

function createChartDataFromDictionary(elem, type, dict) {
    return { elem, type, values: Object.values(dict), labels: Object.keys(dict) };
}

function displayData(transactionData, chartData) {
    document.body.innerHTML = `
    <div id="container">
        <div>
            <h1>Meal Swipes</h1>
            <p><strong>Total Swipes Used:</strong> ${transactionData.mealSwipeTransactions.map(t => +t.swipes).reduce((a, b) => a + b, 0)}</p>
            <center><h3>Meal Swipes Used Per Location</h3></center>
            <canvas id="meal-swipes-pie-chart" width="3" height="1"></canvas>
            <center><h3>Meal Swipes Used Per Week Per Locaiton</h3></center>
            <canvas id="meal-swipes-bar-chart" width="3" height="1"></canvas>
        </div>
        <div>
            <h1>Flex Dollars</h1>
            <p><strong>Total Flex Dollars Spent:</strong> ${transactionData.flexTransactions.filter(t => t.amount < 0).map(t => +t.amount).reduce((a, b) => a + b, 0).toFixed(2)}</p>
            <center><h3>Flex Dollars Spent Per Location</h3></center>
            <canvas id="flex-dollars-pie-chart" width="3" height="1"></canvas>
            <center><h3>Flex Dollars Spent Per Week Per Locaiton</h3></center>
            <canvas id="flex-dollars-bar-chart" width="3" height="1"></canvas>
        </div>
        <div>
            <h1>Debit Account</h1>
            <p><strong>Total Debit Spent:</strong> ${transactionData.debitTransactions.filter(t => t.amount < 0).map(t => +t.amount).reduce((a, b) => a + b, 0).toFixed(2)}</p>
            <center><h3>Debit Spent Per Location</h3></center>
            <canvas id="debit-account-pie-chart" width="3" height="1"></canvas>
            <center><h3>Debit Spent Per Week Per Locaiton</h3></center>
            <canvas id="debit-account-bar-chart" width="3" height="1"></canvas>
        </div>
    </div>
    `;

    console.log(chartData);

    for (let key in chartData) {
        let data = chartData[key];
        switch (data.type) {
            case "pie":
                createPieChart(data);
                break;
            case "bar":
                createBarChart(data);
                break;
        }
    }
}

function createPieChart(pieChartData) {
    return new Chart(document.getElementById(pieChartData.elem).getContext("2d"), {
        type: "pie",
        data: {
            datasets: [{
                data: pieChartData.values,
                backgroundColor: ctx => chartColor(ctx.chart.id, ctx.dataIndex),
                hoverBackgroundColor: ctx => chartColor(ctx.chart.id, ctx.dataIndex)
            }],
            labels: pieChartData.labels
        },
        options: {
            legend: {
                labels: {
                    generateLabels: chart => {
                        return chart.data.labels.map(function (label, i) {
                            var meta = chart.getDatasetMeta(0);

                            return {
                                text: label,
                                fillStyle: chartColor(chart.id, i),
                                strokeStyle: 'none',
                                lineWidth: '0',
                                hidden: isNaN(chart.data.datasets[0].data[i]) || meta.data[i].hidden,

                                // Extra data used for toggling the correct item
                                index: i
                            };
                        });
                    }
                }
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        //get the concerned dataset
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        //calculate the total of this data set
                        var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
                            return previousValue + currentValue;
                        });
                        //get the current items value
                        var currentValue = dataset.data[tooltipItem.index];
                        //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
                        var percentage = Math.floor(((currentValue / total) * 100) + 0.5);

                        return `${data.labels[tooltipItem.index]}: ${currentValue} (${percentage}%)`;
                    }
                }
            }
        }
    });
}

function createBarChart(barChartData) {
    return new Chart(document.getElementById(barChartData.elem).getContext("2d"), {
        type: "bar",
        data: barChartData,
        options: {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                labels: {
                    generateLabels: chart => {
                        let labels = Chart.defaults.global.legend.labels.generateLabels(chart);
                        for (let i = 0; i < labels.length; i++) {
                            labels[i].fillStyle = chartColor(chart.id % 3, i);
                        }
                        return labels;
                    }
                }
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var currentValue = dataset.data[tooltipItem.index];

                        var total = data.datasets.map((d, i) =>  d.data[tooltipItem.index]).reduce((a, b) => a + b, 0);
                        if (!Number.isInteger(total)) {
                            total = total.toFixed(2);
                        }

                        return `${dataset.label}: ${currentValue} / ${total}`;
                    },
                    labelColor: function (tooltipItem, chart) {
                        return { backgroundColor: chartColor(chart.id % 3, tooltipItem.datasetIndex) };
                    }
                }
            }
        }
    });
}

/**
 * Removes " 2" and " S2" from end of string
 * @param {string} text Input string to clean
 */
function clean(text) {
    if (text === "Crossroad S2") {
        return "Crossroads";
    } else if (text.endsWith(" 2")) {
        return text.substring(0, text.length - 2);
    } else if (text.endsWith(" S2")) {
        return text.substring(0, text.length - 3);
    }

    return text;
}

var colors = {};

function generateNewValues() {
    const SAT_RANGE = 20;
    const LIGHT_RANGE = 10;
    let initialHue = Math.random() * 360;
    let hueStep = Math.random() * 10 + 30;
    let initialSaturation = Math.random() * SAT_RANGE;
    let initialLightness = Math.random() * LIGHT_RANGE;
    let satLightStep = Math.random() * 5 + 3;
    return {
        getH: i => initialHue + i * hueStep,
        getS: i => ((initialSaturation + i * satLightStep) % SAT_RANGE) + 50,
        getL: i => ((initialLightness + i * satLightStep) % LIGHT_RANGE) + 50
    };
}

function chartColor(id, index) {
    if (!(id in colors)) {
        colors[id] = generateNewValues();
    }
    let c = colors[id];
    return getColor(c.getH(index), c.getS(index), c.getL(index));
}

function getColor(hue = Math.random() * 360, sat = 50 + 20 * Math.random(), light = 50 + 20 * Math.random()) {
    return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function getWeekDetails(date) {
    let sunday = date;
    sunday.setDate(sunday.getDate() - sunday.getDay());
    sunday.setHours(0, 0, 0, 0);
    let nextSaturday = new Date(sunday.valueOf());
    nextSaturday.setDate(nextSaturday.getDate() + 6);
    let nextSunday = new Date(sunday.valueOf());
    nextSunday.setDate(nextSunday.getDate() + 7);

    return {
        previousSunday: sunday,
        nextSaturday,
        nextSunday,
        description: `${sunday.toDateString()} to ${nextSaturday.toDateString()}`
    };
}

initialize();
