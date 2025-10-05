// Fallback sample data for enrolment status
const fallbackEnrolmentData = [
    { centre_name: 'Papamoa Beach', current: 83, future: 4, waiting: 11, enquiry: 0 },
    { centre_name: 'The Boulevard', current: 72, future: 6, waiting: 9, enquiry: 1 },
    { centre_name: 'The Bach', current: 65, future: 8, waiting: 7, enquiry: 2 },
    { centre_name: 'Terrace Views', current: 80, future: 3, waiting: 5, enquiry: 0 },
    { centre_name: 'Livingstone Drive', current: 77, future: 5, waiting: 6, enquiry: 1 },
    { centre_name: 'West Dune', current: 69, future: 7, waiting: 8, enquiry: 0 }
];

function renderEnrolmentStatus(data) {
    const row = document.getElementById('enrolment-status-row');
    if (!row) return;
    row.innerHTML = '';
    data.forEach((enrol, idx) => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card h-100" style="border-radius:1.1rem;box-shadow:0 2px 8px rgba(30,200,233,0.08),0 1.5px 6px rgba(0,0,0,0.04);">
                <div class="card-header p-0" style="background:linear-gradient(90deg,#1de9b6 0%,#1dc4e9 100%);">
                    <h5 class="m-0 p-2" style="color:#111;">${enrol.centre_name}</h5>
                </div>
                <div class="card-body text-center p-3 pt-2 pb-2">
                    <div class="row mb-1 d-flex justify-content-center align-items-end text-center">
                        <div class="col p-0">
                            <span style="font-size:1.3em;color:#43a047;font-weight:600;">${enrol.current}</span><br>
                            <span class="text-muted" style="font-size:0.95em;">CURRENT</span>
                        </div>
                        <div class="col p-0">
                            <span style="font-size:1.3em;color:#00bcd4;font-weight:600;">${enrol.future}</span><br>
                            <span class="text-muted" style="font-size:0.95em;">FUTURE</span>
                        </div>
                        <div class="col p-0">
                            <span style="font-size:1.3em;color:#fbc02d;font-weight:600;">${enrol.waiting}</span><br>
                            <span class="text-muted" style="font-size:0.95em;">WAITING</span>
                        </div>
                        <div class="col p-0">
                            <span style="font-size:1.3em;color:#ff9800;font-weight:600;">${enrol.enquiry}</span><br>
                            <span class="text-muted" style="font-size:0.95em;">ENQUIRY</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        row.appendChild(card);
    });
}

// On DOMContentLoaded, render fallback enrolment status
document.addEventListener('DOMContentLoaded', function () {
    renderEnrolmentStatus(fallbackEnrolmentData);
});

"use strict";
document.addEventListener("DOMContentLoaded", function () {



    // Fetch occupancy data from Django API
    async function fetchOccupancyData(monthYear) {
        try {
            const response = await fetch(`/api/occupancy/?month_year=${encodeURIComponent(monthYear)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching occupancy data:', error);
            return [];
        }
    }

    // Helper to get the current month in MM-YYYY format
    function getCurrentMonthYear() {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        return `${mm}-${yyyy}`;
    }

    function calcAvg(arr, key) {
        if (!arr.length) return '--';
        const sum = arr.reduce((acc, x) => acc + (x[key] || 0), 0);
        return Math.round((sum / arr.length) * 10) / 10;
    }


// Fallback sample data for design/testing
const fallbackOccupancyData = [
    { centre_name: 'Papamoa Beach', month_year: '07-2025', u2: 85, o2: 90, total: 88 },
    { centre_name: 'The Boulevard', month_year: '07-2025', u2: 78, o2: 82, total: 80 },
    { centre_name: 'The Bach', month_year: '07-2025', u2: 92, o2: 95, total: 94 },
    { centre_name: 'Terrace Views', month_year: '07-2025', u2: 80, o2: 85, total: 83 },
    { centre_name: 'Livingstone Drive', month_year: '07-2025', u2: 88, o2: 91, total: 90 },
    { centre_name: 'West Dune', month_year: '07-2025', u2: 75, o2: 80, total: 78 }
];

async function renderOccupancy(monthYear) {
    const row = document.getElementById('monthly-occupancy-row');
    row.innerHTML = '';
    let data = await fetchOccupancyData(monthYear);
    // Use fallback if no data returned
    if (!Array.isArray(data) || data.length === 0) {
        data = fallbackOccupancyData;
    }
    let avgU2 = calcAvg(data, 'u2');
    let avgO2 = calcAvg(data, 'o2');
    let avgTotal = calcAvg(data, 'total');
    document.getElementById('avg-u2').innerText = `U2: ${avgU2 === undefined || isNaN(avgU2) ? '-' : avgU2}`;
    document.getElementById('avg-o2').innerText = `O2: ${avgO2 === undefined || isNaN(avgO2) ? '-' : avgO2}`;
    document.getElementById('avg-total').innerText = `Total: ${avgTotal === undefined || isNaN(avgTotal) ? '-' : avgTotal}`;
    data.forEach((occ, idx) => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card p-3 mb-3">
                <h5 class="mb-2">${occ.centre_name}</h5>
                <div class="d-flex justify-content-between align-items-center">
                    <div id="donut-u2-${idx}"></div>
                    <div id="donut-o2-${idx}"></div>
                    <div id="donut-total-${idx}"></div>
                </div>
                <div class="mt-2 small text-muted">Month: ${occ.month_year || '-'}</div>
            </div>
        `;
        row.appendChild(card);

        // Render U2 donut or fallback
        if (occ.u2 === undefined || isNaN(occ.u2)) {
            document.querySelector(`#donut-u2-${idx}`).innerHTML = '<span style="font-size:2em;">-</span>';
        } else {
            new ApexCharts(document.querySelector(`#donut-u2-${idx}`), {
                chart: { type: 'donut', width: 80, height: 80 },
                series: [occ.u2, 100 - occ.u2],
                labels: ['U2 Occupied', 'Vacant'],
                colors: ['#1de9b6', '#e0e0e0'],
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: { pie: { donut: { size: '70%' } } }
            }).render();
        }
        // Render O2 donut or fallback
        if (occ.o2 === undefined || isNaN(occ.o2)) {
            document.querySelector(`#donut-o2-${idx}`).innerHTML = '<span style="font-size:2em;">-</span>';
        } else {
            new ApexCharts(document.querySelector(`#donut-o2-${idx}`), {
                chart: { type: 'donut', width: 80, height: 80 },
                series: [occ.o2, 100 - occ.o2],
                labels: ['O2 Occupied', 'Vacant'],
                colors: ['#1dc4e9', '#e0e0e0'],
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: { pie: { donut: { size: '70%' } } }
            }).render();
        }
        // Render Total donut or fallback
        if (occ.total === undefined || isNaN(occ.total)) {
            document.querySelector(`#donut-total-${idx}`).innerHTML = '<span style="font-size:2em;">-</span>';
        } else {
            new ApexCharts(document.querySelector(`#donut-total-${idx}`), {
                chart: { type: 'donut', width: 80, height: 80 },
                series: [occ.total, 100 - occ.total],
                labels: ['Total Occupied', 'Vacant'],
                colors: ['#00b894', '#e0e0e0'],
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: { pie: { donut: { size: '70%' } } }
            }).render();
        }
    });
}


    // Render for the current month on load
    renderOccupancy(getCurrentMonthYear());

    // You can keep the rest of your dashboard JS below
    setTimeout(function () {
        floatchart();
    }, 700);
    // ...existing code...

    for (let i = 1; i <= 6; i++) {
        // U2 Donut
        var donutU2Options = {
            chart: {
                type: 'donut',
                width: 80,
                height: 80,
            },
            series: [45, 55],
            labels: ['Occupied', 'Vacant'],
            colors: ['#1de9b6', '#e0e0e0'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111',
                                offsetY: 6,
                                formatter: function (val) { return '45%'; }
                            },
                            total: { show: false }
                        }
                    }
                }
            }
        };
        var donutU2 = new ApexCharts(document.querySelector(`#donut-u2-${i}`), donutU2Options);
        donutU2.render();

        // O2 Donut
        var donutO2Options = {
            chart: {
                type: 'donut',
                width: 80,
                height: 80,
            },
            series: [45, 55],
            labels: ['Occupied', 'Vacant'],
            colors: ['#1dc4e9', '#e0e0e0'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111',
                                offsetY: 6,
                                formatter: function (val) { return '45%'; }
                            },
                            total: { show: false }
                        }
                    }
                }
            }
        };
        var donutO2 = new ApexCharts(document.querySelector(`#donut-o2-${i}`), donutO2Options);
        donutO2.render();

        // Total Donut
        var donutTotalOptions = {
            chart: {
                type: 'donut',
                width: 80,
                height: 80,
            },
            series: [90, 10],
            labels: ['Occupied', 'Vacant'],
            colors: ['#00b894', '#e0e0e0'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111',
                                offsetY: 6,
                                formatter: function (val) { return '90%'; }
                            },
                            total: { show: false }
                        }
                    }
                }
            }
        };
        var donutTotal = new ApexCharts(document.querySelector(`#donut-total-${i}`), donutTotalOptions);
        donutTotal.render();
    }
});

function floatchart() {
    // [ support-chart ] start
    (function () {
        var options1 = {
            chart: {
                type: 'area',
                height: 85,
                sparkline: {
                    enabled: true
                }
            },
            colors: ["#7267EF"],
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            series: [{
                data: [0, 20, 10, 45, 30, 55, 20, 30, 0]
            }],
            tooltip: {
                fixed: {
                    enabled: false
                },
                x: {
                    show: false
                },
                y: {
                    title: {
                        formatter: function (seriesName) {
                            return 'Ticket '
                        }
                    }
                },
                marker: {
                    show: false
                }
            }
        }
        new ApexCharts(document.querySelector("#support-chart"), options1).render();
        var options2 = {
            chart: {
                type: 'bar',
                height: 85,
                sparkline: {
                    enabled: true
                }
            },
            colors: ["#7267EF"],
            plotOptions: {
                bar: {
                    columnWidth: '70%'
                }
            },
            series: [{
                data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54, 44, 12, 36, 9, 54, 25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 25, 44, 12, 36, 9, 54]
            }],
            xaxis: {
                crosshairs: {
                    width: 1
                },
            },
            tooltip: {
                fixed: {
                    enabled: false
                },
                x: {
                    show: false
                },
                y: {
                    title: {
                        formatter: function (seriesName) {
                            return ''
                        }
                    }
                },
                marker: {
                    show: false
                }
            }
        }
        new ApexCharts(document.querySelector("#support-chart1"), options2).render();
    })();
    // [ support-chart ] end
    // [ account-chart ] start

    (function () {
        var options = {
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
            },
            stroke: {
                width: [0, 3],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            colors: ['#7267EF', '#c7d9ff'],
            series: [{
                name: 'Total Sales',
                type: 'column',
                data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
            }, {
                name: 'Average',
                type: 'line',
                data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
            }],
            fill: {
                opacity: [0.85, 1],
            },
            labels: ['01/01/2003', '02/01/2003', '03/01/2003', '04/01/2003', '05/01/2003', '06/01/2003', '07/01/2003', '08/01/2003', '09/01/2003', '10/01/2003', '11/01/2003'],
            markers: {
                size: 0
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                min: 0
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (y) {
                        if (typeof y !== "undefined") {
                            return "$ " + y.toFixed(0);
                        }
                        return y;

                    }
                }
            },
            legend: {
                labels: {
                    useSeriesColors: true
                },
                markers: {
                    customHTML: [
                        function () {
                            return ''
                        },
                        function () {
                            return ''
                        }
                    ]
                }
            }
        }
        var chart = new ApexCharts(
            document.querySelector("#account-chart"),
            options
        );
        chart.render();
    })();

    // [ account-chart ] end
    // [ satisfaction-chart ] start
    (function () {
        var options = {
            chart: {
                height: 260,
                type: 'pie',
            },
            series: [66, 50, 40, 30],
            labels: ["extremely Satisfied", "Satisfied", "Poor", "Very Poor"],
            legend: {
                show: true,
                offsetY: 50,
            },
            dataLabels: {
                enabled: true,
                dropShadow: {
                    enabled: false,
                }
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#7267EF',
                }
            },
            responsive: [{
                breakpoint: 768,
                options: {
                    chart: {
                        height: 320,

                    },
                    legend: {
                        position: 'bottom',
                        offsetY: 0,
                    }
                }
            }]
        }
        var chart = new ApexCharts(document.querySelector("#satisfaction-chart"), options);
        chart.render();
    })();
    // [ satisfaction-chart ] end
    // [ Monthly Occupancy Donut Charts ] start
    // [ Monthly Occupancy Donut Charts ] end

// Render Monthly Occupancy Donut Charts on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    // Papamoa Beach main donut
    var papamoaOptions = {
        chart: {
            type: 'donut',
            width: 120,
            height: 120,
        },
        series: [60, 40],
        labels: ['Occupied', 'Vacant'],
        colors: ['#1de9b6', '#e0e0e0'],
        dataLabels: { enabled: false },
        legend: { show: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: { show: false },
                        value: {
                            show: true,
                            fontSize: '22px',
                            fontWeight: 600,
                            color: '#111',
                            offsetY: 8,
                            formatter: function (val) { return '60%'; }
                        },
                        total: { show: false }
                    }
                }
            }
        }
    };
    var donutPapamoa = new ApexCharts(document.querySelector('#donut-papamoa'), papamoaOptions);
    if (document.querySelector('#donut-papamoa')) {
        donutPapamoa.render();
    }

    for (let i = 1; i <= 6; i++) {
        // U2 Donut
        var donutU2Options = {
            chart: {
                type: 'donut',
                width: 80,
                height: 80,
            },
            series: [45, 55],
            labels: ['Occupied', 'Vacant'],
            colors: ['#1de9b6', '#e0e0e0'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111',
                                offsetY: 6,
                                formatter: function (val) { return '45%'; }
                            },
                            total: { show: false }
                        }
                    }
                }
            }
        };
        var donutU2 = new ApexCharts(document.querySelector(`#donut-u2-${i}`), donutU2Options);
        donutU2.render();

        // O2 Donut
        var donutO2Options = {
            chart: {
                type: 'donut',
                width: 80,
                height: 80,
            },
            series: [45, 55],
            labels: ['Occupied', 'Vacant'],
            colors: ['#1dc4e9', '#e0e0e0'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111',
                                offsetY: 6,
                                formatter: function (val) { return '45%'; }
                            },
                            total: { show: false }
                        }
                    }
                }
            }
        };
        var donutO2 = new ApexCharts(document.querySelector(`#donut-o2-${i}`), donutO2Options);
        donutO2.render();

        // Total Donut
        var donutTotalOptions = {
            chart: {
                type: 'donut',
                width: 80,
                height: 80,
            },
            series: [90, 10],
            labels: ['Occupied', 'Vacant'],
            colors: ['#00b894', '#e0e0e0'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111',
                                offsetY: 6,
                                formatter: function (val) { return '90%'; }
                            },
                            total: { show: false }
                        }
                    }
                }
            }
        };
        var donutTotal = new ApexCharts(document.querySelector(`#donut-total-${i}`), donutTotalOptions);
        donutTotal.render();
    }
});
    // [ Monthly Occupancy Donut Charts ] end
}