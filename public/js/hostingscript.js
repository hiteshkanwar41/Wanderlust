// Store all Tom Select instances
const tomSelects = {};

async function loadFilters(city="") {
    try {
        const filterdata = await axios.get("/api/analytics/overview/filters",{
        params:  {
        city: city
    }
    });
        console.log(filterdata.data);
        const filtersData = filterdata.data.filtersdata;

        for (const key in filtersData) {
             // City is already hardcoded in HTML
            if (key !== "neighbourhood") continue;
            const select = document.querySelector("#" + key);
            if (!select) continue;

            // Add options
            select.innerHTML = '<option value="" selected disabled>Select a neighbourhood</option>';
            
            for (const value of filtersData[key]) {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            }
            if (select.tomselect) {
        //Update existing Tom Select
            select.tomselect.clear();
            select.tomselect.clearOptions();

            select.tomselect.addOption({
                value: "",
                text: "Select a neighbourhood",
                disabled: true
        }
    );

            filtersData[key].forEach(value => {
                select.tomselect.addOption({
                    value: value,
                    text: value
                });
            });

    select.tomselect.refreshOptions(false);

} else {
    // First time only
    tomSelects[key] = new TomSelect(select, {
        create: false,
        searchField: [],
        allowEmptyOption: true,
        maxOptions: null
    });

    filtersData[key].forEach(value => {
        tomSelects[key].addOption({
            value: value,
            text: value
        });
    });
}
        }

    } catch (err) {
        console.log(err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadFilters();
    
    //this is done so that initially form automatically gets submit for default filters
    //so that charts come automatically
    let filterform=document.querySelector(".filterForm");
    if(filterform){
        filterform.requestSubmit();
    }
});

city=document.querySelector("#city")
if(city){
    city.addEventListener("change",async ()=>{
    console.log("Selected city:", city.value);
    const neighbourhood = document.querySelector("#neighbourhood");

    if (neighbourhood.tomselect) {
        neighbourhood.tomselect.clear();
    }
    await loadFilters(city.value);
})
}



 
 //new i have to learn this
 function animateKPI(element, startval,targetValue, symbol="",duration = 1000) {
    let startTimestamp = null;
    const startValue = startval; // Or current value if you want to animate from existing

    function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Calculate the current value
        const currentValue = Math.floor(progress * targetValue);
        
        // Update the UI
        if(symbol==="$"){
            element.textContent = symbol+currentValue.toLocaleString();
        }else{
            element.textContent = currentValue.toLocaleString()+symbol;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}
 

//new thing learned
 function inputkpi(kpidata) {
    // 1. Guard Clause: If kpidata is null or undefined, stop execution
    if (!kpidata || typeof kpidata !== 'object') {
        console.error("inputkpi received invalid data:", kpidata);
        return;
    }

    Object.entries(kpidata).forEach(([title, value]) => {
        let card = document.querySelector("#" + title);
        if (card) {
            let valueElement = card.querySelector(".kpi-value");
            if (valueElement) {
                // Ensure valueElement exists before accessing textContent
                let startVal =  0;
                if(title=="average_price" || title=="revenue_potential" || title=="median_price"){
                    animateKPI(valueElement, startVal, value,"$");
                }
                else if(title=="occupancy_rate"){
                    animateKPI(valueElement, startVal, value,"%");
                }else{
                    animateKPI(valueElement, startVal, value);
                }
                
            }
        }
    });
}
//Chart.js attaches the chart instance to the canvas DOM element. When you call new Chart()
//  a second time on the same canvas without destroying the old one, Chart.js gets confused because 
// it's trying to manage two charts on one element.
//To fix this, you must keep a reference to your chart instances and call .destroy() on them before creating a new one.
//see we are using roomTypeChart for this

let averagePriceChart = null;
let priceDistributionChart = null;
let listingsRoomTypeChart = null;
let topRevenueChart = null;
let revenueBedroomsChart = null;

function renderAveragePriceChart(chartdata){
    const ctx1 = document.getElementById("average_price_by_room_type");

    if(averagePriceChart){
        averagePriceChart.destroy();
    }

    averagePriceChart = new Chart(ctx1,{
    type:"bar",

    data:{
        labels: chartdata.average_price_by_room_type.labels,
        datasets:[{
            data: chartdata.average_price_by_room_type.values,

            backgroundColor:"#F85D7F",
            hoverBackgroundColor:"#EE4B70",
            borderWidth:0,
            barThickness:38
        }]
    },

    plugins:[ChartDataLabels],
    
    options:{
        responsive:true,
        maintainAspectRatio:false,

        plugins:{

            legend:{
                display:false
            },

            datalabels:{
                anchor:"end",
                align:"top",

                color:"#222",
                font:{
                    weight:"600",
                    size:13
                },

                formatter:(value)=>"$"+value.toLocaleString()
            },

            tooltip:{
                displayColors:false,
                callbacks:{
                    label:(context)=>"$"+context.raw.toLocaleString()
                }
            }

        },

        scales:{

            x:{
                grid:{
                    display:false
                },

                border:{
                    display:false
                },

                ticks:{
                    color:"#666",
                    font:{
                        size:13,
                        weight:"500"
                    }
                }
            },

            y:{

                beginAtZero:true,
                suggestedMax: 600, 
                border:{
                    display:false
                },

                grid:{
                    color:"#F2F2F2",
                    lineWidth:1
                },

                ticks:{
                    stepSize:100,

                    callback:(value)=>"$"+value
                }
            }

        }

    }

});

}
function renderPriceDistributionChart(chartdata){
    const ctx2 = document
    .getElementById("price_distribution")
    .getContext("2d");

if (priceDistributionChart) {
    priceDistributionChart.destroy();
}

priceDistributionChart = new Chart(ctx2, {
    type: "bar",

    data: {
        labels: chartdata.price_distribution.labels,
        datasets: [{
            data: chartdata.price_distribution.values,

            backgroundColor:"#4F7FD9",
            hoverBackgroundColor: "#3A7CEB",

            borderWidth: 0,

            categoryPercentage: 1,
            barPercentage: 1
        }]
    },

    plugins: [ChartDataLabels],

    options: {

        responsive: true,
        maintainAspectRatio: false,

        layout: {
            padding: {
                top: 25,
                left: 10,
                right: 15,
                bottom: 10
            }
        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                displayColors: false,

                backgroundColor: "#222",

                callbacks: {
                    label: function (context) {
                        return context.raw + " Listings";
                    }
                }
            },

            datalabels: {

                anchor: "end",
                align: "top",

                color: "#333",

                font: {
                    size: 12,
                    weight: "600"
                }

            }

        },

        scales: {

            x: {

                title: {
                    display: true,
                    text: "Price Range",
                    color: "#444",

                    font: {
                        size: 14,
                        weight: "600"
                    }
                },

                grid: {
                    display: false
                },

                border: {
                    display: false
                },

                ticks: {

                    color: "#666",
                    maxRotation:0,
                    minRotation:0,
                    font: {
                        size: 12
                    }

                }

            },

            y: {

                beginAtZero: true,

                title: {

                    display: true,
                    text: "Number of Listings",

                    color: "#444",

                    font: {
                        size: 14,
                        weight: "600"
                    }

                },

                grid: {
                    color: "#EFEFEF"
                },

                border: {
                    display: false
                },

                ticks: {

                    color: "#666",
                    maxRotation:0,
                    minRotation:0,
                    precision: 0

                }

            }

        }

    }

});

}

function renderMarketShareChart(chartdata){
    const ctx3 = document.getElementById("listings_by_room_type").getContext("2d");
    
    if (listingsRoomTypeChart) {
        listingsRoomTypeChart.destroy();
    }

    listingsRoomTypeChart = new Chart(ctx3, {
    type: "doughnut",

    data: {
        labels: chartdata.listings_by_room_type.labels,
        datasets: [{
            data: chartdata.listings_by_room_type.values,

            backgroundColor: [ "#FF6384", "#FF9FB2", "#FFD1DC", "#FFE6EC" ],

            borderWidth: 0,
            hoverOffset: 8
        }]
    },

    plugins: [ChartDataLabels],

    options: {

        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        plugins: {

            legend: {
                position: "right",

                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 18,

                    font: {
                        size: 13,
                        weight: "500"
                    }
                }
            },

            tooltip: {
                displayColors: true
            },

            datalabels: {
                color: "#fff",
                font: {
                    weight: "bold",
                    size: 12
                },
                formatter:(value,ctx)=>{

                    const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                    const percentage = value*100/total;

                    if(percentage<3){
                        return "";
                    }

                    return percentage.toFixed(1)+"%";
            }
            }

        }

    }

});
}

function renderTopRevenueChart(chartdata){
    const ctx4 = document
    .getElementById("top_5_revenue_listings")
    .getContext("2d");

if (topRevenueChart) {
    topRevenueChart.destroy();
}

topRevenueChart = new Chart(ctx4, {
    type: "bar",

    data: {
        labels: chartdata.top_5_revenue_listings.labels,

        datasets: [{
            data: chartdata.top_5_revenue_listings.values,

            backgroundColor: "#4E79A7",
            hoverBackgroundColor: "#3C638C",

            borderWidth: 0,
            barThickness: 28
        }]
    },

    plugins: [ChartDataLabels],

    options: {

        indexAxis: "y",

        responsive: true,
        maintainAspectRatio: false,

        layout: {
            padding: {
                top: 15,
                right: 60,
                left: 5,
                bottom: 10
            }
        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                displayColors: false,

                callbacks: {

                    label: function(context){
                        return "$" + context.raw.toLocaleString();
                    }

                }

            },

            datalabels:{
                anchor:"end",
                align:"end",
                offset:4,
                clip:false,
                color:"#333",
                font:{
                    weight:"600"
                },
                formatter:(value)=>"$"+value.toLocaleString()
            }

        },

        scales: {

            x: {

                beginAtZero: true,

                title: {

                    display: true,
                    text: "Estimated Annual Revenue ($)",

                    color: "#444",

                    font: {
                        size: 14,
                        weight: "600"
                    }

                },

                grid: {
                    color: "#EFEFEF"
                },

                border: {
                    display: false
                },

                ticks: {

                    color: "#666",
                    maxRotation:0,
                    minRotation:0,
                    callback: (value) => "$" + value

                }

            },

            y: {

                title: {

                    display: true,
                    text: "Competitor Listings",

                    color: "#444",

                    font: {
                        size: 14,
                        weight: "600"
                    }

                },

                grid: {
                    display: false
                },

                border: {
                    display: false
                },

                ticks: {
                    color: "#666"
                }

            }

        }

    }

});
}

function renderRevenueBedroomChart(chartdata){
    const ctx5 = document
    .getElementById("revenue_by_bedrooms")
    .getContext("2d");

if (revenueBedroomsChart) {
    revenueBedroomsChart.destroy();
}

revenueBedroomsChart = new Chart(ctx5, {
    type: "line",

    data: {
        labels: chartdata.revenue_by_bedrooms.labels,

        datasets: [{
            label: "Average Revenue",

            data: chartdata.revenue_by_bedrooms.values,

            borderColor: "#14B8A6",
            backgroundColor: "rgba(20,184,166,0.15)",

            pointBackgroundColor: "#14B8A6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,

            borderWidth: 3,
            fill: true,
            tension: 0.35
        }]
    },

    plugins: [ChartDataLabels],

    options: {

        responsive: true,
        maintainAspectRatio: false,

        layout: {
            padding: {
                top: 25,
                left: 10,
                right: 20,
                bottom: 10
            }
        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                displayColors: false,

                callbacks: {

                    label: function(context){
                        return "$" + context.raw.toLocaleString();
                    }

                }

            },

            datalabels: {

                align: "top",
                anchor: "end",

                color: "#333",

                font: {
                    size: 12,
                    weight: "600"
                },

                formatter: (value)=>"$"+value.toLocaleString()

            }

        },

        scales: {

            x: {

                title: {

                    display: true,
                    text: "Number of Bedrooms",

                    color: "#444",

                    font: {
                        size: 14,
                        weight: "600"
                    }

                },

                grid: {
                    display: false
                },

                border: {
                    display: false
                },

                ticks: {
                    color: "#666"
                }

            },

            y: {

                beginAtZero: true,

                title: {

                    display: true,
                    text: "Average Revenue ($)",

                    color: "#444",

                    font: {
                        size: 14,
                        weight: "600"
                    }

                },

                grid: {
                    color: "#EFEFEF"
                },

                border: {
                    display: false
                },

                ticks: {

                    color: "#666",

                    callback: (value)=>"$"+value

                }

            }

        }

    }

});

}




function observeChart(cardId, renderFunction, chartData) {

    const card = document.getElementById(cardId);

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

             if (entry.isIntersecting) {

                setTimeout(() => {
                    renderFunction(chartData);
                }, 100);

                observer.disconnect();
            }

        });

    }, {
        rootMargin: "0px 0px -120px 0px",
        threshold: 0
    });

    observer.observe(card);
}








document.addEventListener("DOMContentLoaded", () => {
        //new thing learned
const form=document.querySelector(".filterForm")
let analyticsData;
if(form){
    form.addEventListener("submit",async (event)=>{
       try{
             event.preventDefault();
        
        const formData=new FormData(form);
        const data=Object.fromEntries(formData.entries())
        console.log(data);
        // NOTE: Replaced direct Flask call with an Express proxy route (/api/analytics/overview).
        // Direct calls to 'http://127.0.0.1:5000' were failing due to CORS policy (Cross-Origin Resource Sharing).
        // Browsers block frontend requests to different ports/origins for security. 
        // Using our Express backend as a proxy allows server-to-server communication, which bypasses CORS.
        // displayData=await axios.get("http://127.0.0.1:5000/overview");
        
        const response2 = await axios.get("/api/analytics/overview",{
         params: data,
      });
        analyticsData=response2.data;
        
        if (analyticsData){
            const pageTitle=document.querySelector(".page-title");
            const para=pageTitle.querySelector("p");
            para.innerText=`Market performance insights for ${data.city},${data.neighbourhood}`;
            inputkpi(analyticsData.kpis);
            
            observeChart(
                "card-average-price",
                renderAveragePriceChart,
                analyticsData.charts
            );

            observeChart(
                "card-price-distribution",
                renderPriceDistributionChart,
                analyticsData.charts
            );

            observeChart(
                "card-market-share",
                renderMarketShareChart,
                analyticsData.charts
            );

            observeChart(
                "card-top-revenue",
                renderTopRevenueChart,
                analyticsData.charts
            );

            observeChart(
                "card-revenue-bedroom",
                renderRevenueBedroomChart,
                analyticsData.charts
            );
        }
        
       }catch(err){
        console.log(err);
       }
    })
}

});
 

