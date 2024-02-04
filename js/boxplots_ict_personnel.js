function init_svg_boxplot() {
    d3v6.select("#threesp")
    .append("svg")
      .attr("id","threesp_svg");
}

function plot_boxplot_years(highlight_countries) {

    var svg = d3v6.select("#threesp_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("threesp_svg").clientWidth;
    const height =  document.getElementById("threesp_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};


    d3v6.tsv(
        "data/estat_tin00085.tsv",
        function(d) {

        var country = d["freq,nace_r2,geo\\TIME_PERIOD"];
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


        const x = d3v6.scalePoint()
            .domain(Object.keys(filteredData[0]).filter(function(value) { return !isNaN(value);}))
            .range([0, width - margin.left - margin.right]);
        const y = d3v6.scaleLinear()
            .domain([0, 1 + d3v6.max(filteredData, d => d3v6.max(Object.values(d).filter(function(value) { return !isNaN(value);})) )])
            .range([ height - margin.top - margin.bottom, 0]);

        
        var colorScale = d3v6.scaleOrdinal()
            .domain(filteredData.map(el => el.country))
            .range(filteredData.map(el => get_color(el.country)));

        var depthScale = d3v6.scaleOrdinal()
            .domain(filteredData.map(el => el.country))
            .range(filteredData.map(el => {if (el.country == "UK") return 5; else return 1;}));
        

        const step = 5

        const years = Object.keys(filteredData[0]).filter(key => !isNaN(key))
        
        const mustache_len = 10;
        const box_len = 20
        const circle_r = 3


        const yearStats = years.map(year => {

            const mean = d3v6.mean(filteredData.map(d => d[year]).filter(el => el != null))
            const q25 = d3v6.quantile(filteredData.map(d => d[year]).filter(el => el != null), 0.25)
            const q75 = d3v6.quantile(filteredData.map(d => d[year]).filter(el => el != null), 0.75)
            const iqr = q75 - q25;

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

        const all_outliers = yearStats
                             .map(ys => ys.outliers
                                 .map(outl => { return {data : outl, year : ys["year"]}}))
                             .flat(1)




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


        var tooltip = d3v6.select("#threesp_svg")
            .append("div")
              .style("opacity", 0)
              .attr("class", "tooltip")
              .style("font-size", "16px")
        

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


            const all_special = filteredData.filter(el => highlight_countries.includes(el.country))
                .map(country => years
                    .map(year => { return {name: country.country, value : country[year], year : year}}))
                .flat(1).filter(el => el.value !== null)

            var colorScale = d3v6.scaleOrdinal()
                .domain(filteredData.map(el => el.country))
                .range(filteredData.map(el => get_color(el.country)));
            
            console.log(filteredData.map(el => el.country))
            console.log(filteredData.map(el => get_color(el.country)))
            console.log(all_special.map(el => el.name))
            console.log(all_special.map(el => el.value))
            svg
                .selectAll("special")
                .data(all_special)
                .enter()
                .append("circle")
                    .attr("cx", d => x(d["year"]))
                    .attr("cy", d => y(d["value"]))
                    .attr("r", circle_r)
                    .attr("stroke", "black")
                    .style("fill", d => colorScale(d.name))
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

            svg
                .selectAll("special_text")
                .data(all_special)
                .enter()
                .append("text")
                .classed("tooltip_text", true)
                    .attr("x", d=> x(d["year"]) + mustache_len/2)
                    .attr("y", d => y(d["value"]))
                    .text(d => d.name)
                    .attr("stroke",  d => colorScale(d.name))
                    .attr("dy", "0.35em") // Adjust vertical alignment if needed
                    .style("font-size", "10px") // Adjust font size as needed
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);
                    
                
          
    })
    return;
}
  
var highlight_countries = []

init_svg_boxplot()
plot_boxplot_years(highlight_countries)


window.addEventListener('resize', function(){
    plot_boxplot_years(highlight_countries);
});