
'use strict';
document.addEventListener("DOMContentLoaded", function () {
    console.log('ApexCharts:', typeof ApexCharts !== 'undefined' ? 'loaded' : 'NOT loaded');
    setTimeout(function () {
        floatchart()
    }, 700);
    // [ campaign-scroll ] start
    var px = new PerfectScrollbar('.feed-scroll', {
        wheelSpeed: .5,
        swipeEasing: 0,
        wheelPropagation: 1,
        minScrollbarLength: 40,
    });
    var px = new PerfectScrollbar('.pro-scroll', {
        wheelSpeed: .5,
        swipeEasing: 0,
        wheelPropagation: 1,
        minScrollbarLength: 40,
    });
    // [ campaign-scroll ] end

    // Render three donuts for every card
    for (let i = 1; i <= 6; i++) {
        // Center donut (main)
        var centerEl = document.querySelector(`#donut-${i}`);
        var centerFallback = document.querySelector(`#donut-${i}-fallback`);
        console.log('Rendering center donut for card', i, centerEl);
        if (centerEl) {
            var centerOptions = {
                chart: { type: 'donut', width: 120, height: 120 },
                series: [60, 40],
                labels: ['Occupied', 'Vacant'],
                colors: ['#1de9b6', '#e0e0e0'],
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: { pie: { donut: { size: '70%' } } }
            };
            var donutCenter = new ApexCharts(centerEl, centerOptions);
            donutCenter.render().then(function() {
                if (centerFallback) centerFallback.style.display = 'none';
            }).catch(function() {
                if (centerFallback) centerFallback.style.display = 'block';
            });
        } else if (centerFallback) {
            centerFallback.style.display = 'block';
        }

        // Left donut
        var leftEl = document.querySelector(`#donut-${i}-left`);
        var leftFallback = document.querySelector(`#donut-${i}-left-fallback`);
        console.log('Rendering left donut for card', i, leftEl);
        if (leftEl) {
            var leftOptions = {
                chart: { type: 'donut', width: 100, height: 100 },
                series: [30, 70],
                labels: ['Occupied', 'Vacant'],
                colors: ['#1dc4e9', '#e0e0e0'],
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: { pie: { donut: { size: '70%' } } }
            };
            var donutLeft = new ApexCharts(leftEl, leftOptions);
            donutLeft.render().then(function() {
                if (leftFallback) leftFallback.style.display = 'none';
            }).catch(function() {
                if (leftFallback) leftFallback.style.display = 'block';
            });
        } else if (leftFallback) {
            leftFallback.style.display = 'block';
        }

        // Right donut
        var rightEl = document.querySelector(`#donut-${i}-right`);
        var rightFallback = document.querySelector(`#donut-${i}-right-fallback`);
        console.log('Rendering right donut for card', i, rightEl);
        if (rightEl) {
            var rightOptions = {
                chart: { type: 'donut', width: 100, height: 100 },
                series: [80, 20],
                labels: ['Occupied', 'Vacant'],
                colors: ['#00b894', '#e0e0e0'],
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: { pie: { donut: { size: '70%' } } }
            };
            var donutRight = new ApexCharts(rightEl, rightOptions);
            donutRight.render().then(function() {
                if (rightFallback) rightFallback.style.display = 'none';
            }).catch(function() {
                if (rightFallback) rightFallback.style.display = 'block';
            });
        } else if (rightFallback) {
            rightFallback.style.display = 'block';
        }
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