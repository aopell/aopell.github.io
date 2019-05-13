class TimeSpan {
    /**
     * Creates a new TimeSpan with the given values for each portion
     * @param {Date|TimeSpan|number} [t=0] Date, TimeSpan, or number of milliseconds 
     * @param {number} [s=0] Seconds
     * @param {number} [m=0] Minutes
     * @param {number} [h=0] Hours
     * @param {number} [d=0] Days
     */
    constructor(t = 0, s = 0, m = 0, h = 0, d = 0) {
        this.totalMilliseconds = (
            t +
            s * 1000 +
            m * 1000 * 60 +
            h * 1000 * 60 * 60 +
            d * 1000 * 60 * 60 * 24
        );
    }

    /**
     * TimeSpan representing no time
     * @type {TimeSpan}
     */
    static get zero() {
        return new TimeSpan();
    }

    /**
     * Creates a TimeSpan representing the given number of milliseconds
     * @param {number} t A number of milliseconds
     * @returns {TimeSpan}
     */
    static fromMilliseconds(t) {
        return new TimeSpan(t);
    }

    /**
     * Creates a TimeSpan representing the given number of seconds
     * @param {number} t A number of seconds
     * @returns {TimeSpan}
     */
    static fromSeconds(s) {
        return new TimeSpan(s * 1000);
    }

    /**
     * Creates a TimeSpan representing the given number of minutes
     * @param {number} t A number of minutes
     * @returns {TimeSpan}
     */
    static fromMinutes(m) {
        return new TimeSpan(m * 1000 * 60);
    }

    /**
     * Creates a TimeSpan representing the given number of hours
     * @param {number} t A number of hours
     * @returns {TimeSpan}
     */
    static fromHours(h) {
        return new TimeSpan(h * 1000 * 60 * 60);
    }

    /**
     * Creates a TimeSpan representing the given number of days
     * @param {number} t A number of days
     * @returns {TimeSpan}
     */
    static fromDays(d) {
        return new TimeSpan(d * 1000 * 60 * 60 * 24);
    }

    /**
     * The total number of full and partial seconds in the TimeSpan
     * @returns {number}
     */
    get totalSeconds() {
        return this.totalMilliseconds / 1000;
    }

    /**
     * The total number of full and partial minutes in the TimeSpan
     * @returns {number}
     */
    get totalMinutes() {
        return this.totalSeconds / 60;
    }

    /**
     * The total number of full and partial hours in the TimeSpan
     * @returns {number}
     */
    get totalHours() {
        return this.totalMinutes / 60;
    }

    /**
     * The total number of full and partial days in the TimeSpan
     * @returns {number}
     */
    get totalDays() {
        return this.totalHours / 24;
    }

    /**
     * The milliseconds component of the TimeSpan
     * @returns {number} An integer number of milliseconds from 0 to 999
     */
    get milliseconds() {
        return Math.floor(this.totalMilliseconds % 1000);
    }

    /**
     * The seconds component of the TimeSpan
     * @returns {number} An integer number of seconds from 0 to 59
     */
    get seconds() {
        return Math.floor(this.totalSeconds % 60);
    }

    /**
     * The minutes component of the TimeSpan
     * @returns {number} An integer number of minutes from 0 to 59
     */
    get minutes() {
        return Math.floor(this.totalMinutes % 60);
    }

    /**
     * The hours component of the TimeSpan
     * @returns {number} An integer number of hours from 0 to 24
     */
    get hours() {
        return Math.floor(this.totalHours % 24);
    }

    /**
     * The days component of the TimeSpan
     * @returns {number} An integer number of days greater than or equal to 0
     */
    get days() {
        return Math.floor(this.totalDays);
    }

    /**
     * Returns a short string representation of the TimeSpan
     * @example
     * let t = new TimeSpan(100)
     * console.log(t.toShortString()) // "100 milliseconds"
     * t = t.add(900)
     * console.log(t.toShortString()) // "1 second"
     * t = TimeSpan.fromHours(3.4)
     * console.log(t.toShortString()) // "3 hours"
     * @returns {string}
     */
    toShortString() {
        let unit =
            Math.abs(this.totalDays) >= 1
                ? `day${Math.floor(Math.abs(this.totalDays)) == 1 ? '' : 's'}`
                : Math.abs(this.totalHours) >= 1
                    ? `hour${Math.floor(Math.abs(this.totalHours)) == 1 ? '' : 's'}`
                    : Math.abs(this.totalMinutes) >= 1
                        ? `minute${Math.floor(Math.abs(this.totalMinutes)) == 1 ? '' : 's'}`
                        : Math.abs(this.totalSeconds) >= 1
                            ? `second${Math.floor(Math.abs(this.totalSeconds)) == 1 ? '' : 's'}`
                            : `millisecond${Math.floor(Math.abs(this.totalMilliseconds)) == 1 ? '' : 's'}`
        return Math.floor({
            day: this.totalDays,
            hour: this.totalHours,
            minute: this.totalMinutes,
            second: this.totalSeconds,
            millisecond: this.totalMilliseconds,
        }[unit.endsWith('s') ? unit.slice(0, -1) : unit]) + ' ' + unit;
    }

    /**
     * Returns a long string representation of the TimeSpan
     * @example
     * let t = TimeSpan.fromHours(3.4)
     * console.log(t.toLongString()) // "3 hours 24 minutes"
     * console.log(t.toLongString(true)) // "0 days 3 hours 24 minutes 0 seconds"
     * t = t.add(3500)
     * console.log(t.toLongString()) // "3 hours 24 minutes 3 seconds"
     * console.log(t.toLongString(true)) // "0 days 3 hours 24 minutes 3 seconds"
     * console.log(t.toLongString(false, true)) // "3 hours 24 minutes 3 seconds 500 milliseconds"
     * @param {boolean} [includeZeroValues = false] Whether or not to include zero values in the string
     * @param {boolean} [includeMilliseconds = false] Whether or not to include milliseconds in the string
     * @returns {string}
     */
    toLongString(includeZeroValues = false, includeMilliseconds = false) {
        if (this.totalMilliseconds == 0) {
            return includeMilliseconds ? "0 milliseconds" : "0 seconds";
        }
        let string = "";
        if (includeZeroValues || this.days) string += `${this.days} day${this.days === 1 ? '' : 's'} `;
        if (includeZeroValues || this.hours) string += `${this.hours} hour${this.hours === 1 ? '' : 's'} `;
        if (includeZeroValues || this.minutes) string += `${this.minutes} minute${this.minutes === 1 ? '' : 's'} `;
        if (includeZeroValues || this.seconds) string += `${this.seconds} second${this.seconds === 1 ? '' : 's'} `;
        if (includeMilliseconds && (includeZeroValues || this.milliseconds)) string += `${this.milliseconds} millisecond${this.milliseconds === 1 ? '' : 's'}`;
        return string.trim();
    }

    /**
     * Returns a string representation of the TimeSpan
     * @example
     * let t = new TimeSpan(TimeSpan.fromHours(3) + TimeSpan.fromMinutes(24) + TimeSpan.fromSeconds(32))
     * console.log(t.toString()) // "03:24:32"
     * t = t.add(500)
     * console.log(t.toString()) // "03:24:32.500"
     * t = t.add(TimeSpan.fromDays(1))
     * console.log(t.toString()) // "1.03:24:32.500"
     */
    toString() {
        let pad = (n, w = 2, z = '0') => n.toString().padStart(w, z);
        return `${this.totalMilliseconds < 0 ? '-' : ''}${Math.abs(this.days) > 0 ? `${Math.abs(this.days)}.` : ""}${pad(Math.abs(this.hours))}:${pad(Math.abs(this.minutes))}:${pad(Math.abs(this.seconds))}${Math.abs(this.milliseconds) > 0 ? `.${Math.abs(this.milliseconds).toString().padEnd(3, '0')}` : ""}`;
    }

    /**
     * Returns the number of milliseconds in the TimeSpan
     * @returns {number}
     */
    valueOf() {
        return this.totalMilliseconds;
    }

    /**
     * Returns a new TimeSpan representing the value of
     * the current TimeSpan plus the value of another TimeSpan
     * or individual values for each interval
     * @param {TimeSpan|number} t TimeSpan or milliseconds
     * @param {number} [s=0] Seconds
     * @param {number} [m=0] Minutes
     * @param {number} [h=0] Hours
     * @param {number} [d=0] Days
     */
    add(t, s = 0, m = 0, h = 0, d = 0) {
        let ms = t;
        if (s) ms += s * 1000;
        if (m) ms += m * 60 * 1000;
        if (h) ms += h * 60 * 60 * 1000;
        if (d) ms += d * 24 * 60 * 60 * 1000;
        return new TimeSpan(this.totalMilliseconds + ms);
    }

    /**
     * Returns a new TimeSpan representing the value of
     * the current TimeSpan minus the value of another TimeSpan
     * or individual values for each interval
     * @param {TimeSpan|number} t TimeSpan or milliseconds
     * @param {number} [s=0] Seconds
     * @param {number} [m=0] Minutes
     * @param {number} [h=0] Hours
     * @param {number} [d=0] Days
     */
    subtract(t, s = 0, m = 0, h = 0, d = 0) {
        return this.add.apply(this, Array.from(arguments).map(x => -x));
    }

    /**
     * Returns a value indicating whether this instance is equal to a specified TimeSpan object
     * @param {TimeSpan} t Another TimeSpan object
     */
    equals(t) {
        return this.totalMilliseconds === t.totalMilliseconds;
    }

    /**
     * Compares this TimeSpan to another TimeSpan, returning an integer that indicates
     * whether this instance is less than, equal to, or greater than the specified TimeSpan
     * @param {TimeSpan} t Another TimeSpan object
     * @returns {Number} A positive number if `this > t`, 0 if `this == t`, a negative number if `this < t`
     */
    compareTo(t) {
        return this.totalMilliseconds - t.totalMilliseconds;
    }

    /**
     * Returns a new TimeSpan equal to the absolute value of this TimeSpan
     * @returns {TimeSpan}
     */
    duration() {
        return new TimeSpan(Math.abs(this.totalMilliseconds));
    }

    /**
     * Returns a new TimeSpan equal to the negated value of this TimeSpan
     * @returns {TimeSpan}
     */
    negate() {
        return new TimeSpan(-this.totalMilliseconds);
    }

    /**
     * @private
     * Regular expression matching a valid TimeSpan string
     */
    static get _regex() {
        return /(?:(\d+)\.)?(0[0-9]|1[0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9])(?:\.([0-9]{3}))?/;
    }

    /**
     * Parses strings in the format returned from `toString`
     * into TimeSpan objects
     * @param {string} s A string representation of a TimeSpan
     * @returns {TimeSpan}
     */
    static parse(s) {
        if (typeof s !== "string") throw new TypeError("Parameter s must be of type string");
        let match = s.match(TimeSpan._regex);
        if (match) {
            let n = [undefined];
            n.push(...Array.from(match).slice(1).map(x => x ? Number.parseInt(x) : x));
            return new TimeSpan(n[5], n[4], n[3], n[2], n[1]);
        }
        throw new Error(`Input string was not in the correct format: "${s}"`);
    }
}

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

        let table = document.querySelector("#content_window > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody");
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