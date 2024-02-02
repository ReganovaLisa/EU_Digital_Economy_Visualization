
function init_svg_scatterplot() {
    d3v6.select("#scatter")
    .append("svg")
      .attr("id","scatter_svg");
}

function getFirstFloatFromString(str) {
var match = str.match(/-?\d+(\.\d+)?/);
return match ? parseFloat(match[0]) : null;
}

function plot_scatter(highlight_countries,buisness_size) {

    var svg = d3v6.select("#scatter_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("scatter_svg").clientWidth;
    const height =  document.getElementById("scatter_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};


    d3v6.csv(
        "scatter_data.csv",
        function(d) {

        var country = d["country"];
        var countryParts = country.split(",");
        d["country"] = countryParts[countryParts.length - 1].trim();
        delete d["freq,nace_r2,geo\\TIME_PERIOD"];
        
        for (var year in d) {
            if (year !== "country") {
                d[getFirstFloatFromString(year)] = getFirstFloatFromString(d[year]);
                delete d[year]
            }
        }
        d["ICT"] = countryParts[1].trim();
        return d;
        }).then(function(data) {

        var filteredData = data.filter(function(d) {
            var numericValuesCount = 0;
            for (var key in d) {
                if (key !== "ICT" && key !== "country" && !(null == d[key])) {
                    numericValuesCount++;
                }
            }
            return numericValuesCount >= 1;
        }).filter(el => el.ICT == "ICT");


        const x = d3.scaleLinear()
        .domain([0, 100])
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
    
      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 400000])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

        const years = Object.keys(filteredData[0]).filter(key => !isNaN(key))
        
        const mustache_len = 10;
        const box_len = 20
        const circle_r = 3

        console.log(years)

        const yearStats = years.map(year => {

            const mean = d3v6.mean(filteredData.map(d => d[year]).filter(el => el != null))
            const q25 = d3v6.quantile(filteredData.map(d => d[year]).filter(el => el != null), 0.25)
            const q75 = d3v6.quantile(filteredData.map(d => d[year]).filter(el => el != null), 0.75)
            const iqr = q75 - q25;

            // console.log(mean, q25, q75, iqr)
            console.log(year, filteredData
                                .filter(el => el[year] != null)
                                .filter(el => (el[year] > q75 + 1.5*iqr)))
            
            return {
                year : year,
                mean : mean,
                q25 : q25,
                q75 : q75,
                iqr : iqr,
                outliers: filteredData
                    .filter(el => el[year] != null)
                    .filter(el => (el[year] > q75 + 1.5*iqr) || (el[year] < q25 - 1.5*iqr))
            };
        })

        // console.log((yearStats.filter(ys => ys.outliers.length > 0).map(ys => ys.year)))
        // console.log((yearStats.filter(ys => ys.outliers.length > 0).map(ys => ys.outliers)))
        // console.log((yearStats.map(ys => ys.outliers)).flat(1))
        
        //console.log((yearStats.map(ys => ys.outliers.map(outl => {outl["y_outl"] = ys["year"]; return outl;}))).flat(1))
        const all_outliers = yearStats
                             .map(ys => ys.outliers
                                 .map(outl => { return {data : outl, year : ys["year"]}}))
                             .flat(1)

        console.log(all_outliers)



        svg.append("g").append("rect")
            .attr("width", width - margin.left/2)
            .attr("height", height - margin.top - margin.bottom/2)
            .attr("fill", "white")
            .attr("transform", `translate(${margin.left/2}, ${margin.top})`)

        svg.append("g")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom/2})`)
            .call(d3v6.axisBottom(x));
        svg.append("g")
            .attr("transform", `translate(${margin.left/2}, ${margin.top})`)
            .call(d3v6.axisLeft(y))


        svg
            .selectAll("mustaches")
            .data(yearStats)
            .enter()
            .append("line")
              .attr("y1", d => y(d.q25 - 1.5*d.iqr))
              .attr("y2", d => y(d.q75 + 1.5*d.iqr))
              .attr("x1", d => x(d.year))
              .attr("x2", d => x(d.year))
              .attr("stroke", "black")
              .style("width", 40)
              .attr("transform", `translate(${margin.left}, ${margin.top})`)

        
        svg
            .selectAll("mustache_bottom")
            .data(yearStats)
            .enter()
            .append("line")
            .attr("y1", d => y(d.q25 - 1.5*d.iqr))
            .attr("y2", d => y(d.q25 - 1.5*d.iqr))
            .attr("x1", d => x(d.year) - mustache_len/2)
            .attr("x2", d => x(d.year) + mustache_len/2)
            .attr("stroke", "black")
            .style("width", 40)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        svg
            .selectAll("mustache_top")
            .data(yearStats)
            .enter()
            .append("line")
            .attr("y1", d => y(d.q75 + 1.5*d.iqr))
            .attr("y2", d => y(d.q75 + 1.5*d.iqr))
            .attr("x1", d => x(d.year) - mustache_len/2)
            .attr("x2", d => x(d.year) + mustache_len/2)
            .attr("stroke", "black")
            .style("width", 40)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)


        svg
            .selectAll("boxes")
            .data(yearStats)
            .enter()
            .append("rect")
                .attr("x", d => x(d.year) - box_len/2) // console.log(x(d.value.q1)) ;
                .attr("width", d => box_len) //console.log(x(d.value.q3)-x(d.value.q1))
                .attr("y", d => y(d.q75))
                .attr("height", d => y(d.q25) - y(d.q75) )
                .attr("stroke", "black")
                .style("fill", "#69b3a2")
                .style("opacity", 0.9)
                .attr("transform", `translate(${margin.left}, ${margin.top})`)

        svg
            .selectAll("means")
            .data(yearStats)
            .enter()
            .append("line")
                .attr("y1", d => y(d.mean))
                .attr("y2", d => y(d.mean))
                .attr("x1", d => x(d.year) - box_len/2)
                .attr("x2", d => x(d.year) + box_len/2)
                .attr("stroke", "black")
                .style("width", 200)
                .attr("transform", `translate(${margin.left}, ${margin.top})`)


        var tooltip = d3v6.select("#scatter_svg")
            .append("div")
              .style("opacity", 0)
              .attr("class", "tooltip")
              .style("font-size", "16px")
        
        const d_short = 30

        svg
            .selectAll("outliers")
            .data(all_outliers)
            .enter()
            .append("circle")
                .attr("cx", d => x(d["year"]))
                .attr("cy", d => y(d["data"][d["year"]]))
                .attr("r", circle_r)
                .attr("stroke", "black")
                .style("fill", "violet")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .on("mouseover", function(event,d_) {
                    svg.selectAll("tool_text")
                    .data([d_])
                    .enter().append("text")
                    .classed("tooltip_text", true)
                    .attr("x", function(d) {
                        return x(d["year"]) + mustache_len/2;
                    })
                    .attr("y", function(d) {
                       return y(d["data"][d["year"]]);
                    })
                    .text(function(d) {
                        return d["data"]["country"];
                    })
                    .attr("stroke",  d => colorScale(d["data"]["country"]))
                    .attr("dy", "0.35em") // Adjust vertical alignment if needed
                    .style("font-size", "10px") // Adjust font size as needed
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);
                })
                .on("mousemove", function (event,d) {
                    return tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
                    })
                .on("mouseout", function(d) {
                    svg.selectAll("text.tooltip_text").remove();
                });
          
    })
    return;
}
  
var highlight_countries = 0

init_svg_scatterplot()
plot_boxplot_years(highlight_countries)


window.addEventListener('resize', function(){
plot_boxplot_years(highlight_countries);
});