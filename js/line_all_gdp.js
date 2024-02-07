function init_svg_line_all() {
  d3v6.select("#twosp")
  .append("svg")
    .attr("id","twosp_svg");
}

function plot_data_years(highlight_countries) {

      var svg = d3v6.select("#twosp_svg");
      svg.selectAll("*").remove();
        
      const width = document.getElementById("twosp_svg").clientWidth;
      const height =  document.getElementById("twosp_svg").clientHeight;
      const margin =  {top: 30, right: 30, bottom: 30, left: 30};


      d3v6.tsv(
        "data/estat_tin00074.tsv",
        function(d){
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
            return numericValuesCount >= 4;
          }).filter(el => el.ICT == "ICT");


          const x = d3v6.scalePoint()
            .domain(Object.keys(filteredData[0]).filter(function(value) { return !isNaN(value);}))
            .range([0, width - margin.left - margin.right]);
          const y = d3v6.scaleLinear()
            .domain([d3v6.min(filteredData, d => d3v6.min(Object.values(d).filter(function(value) { return !isNaN(value);})) ) - 0.5, 
            d3v6.max(filteredData, d => d3v6.max(Object.values(d).filter(function(value) { return !isNaN(value);})) ) + 0.5])
            .range([ height - margin.top - margin.bottom, 0]);

          
          var colorScale = d3v6.scaleOrdinal()
            .domain(filteredData.map(el => el.country))
            .range(filteredData.map(el => get_color(el.country)));

          var depthScale = d3v6.scaleOrdinal()
            .domain(filteredData.map(el => el.country))
            .range(filteredData.map(el => {if (get_color(el.country) != "grey") return 4; else return 1;}));
          

          const step = 5

          var line = d3v6.line()
            .x(d => x(d.year))
            .y(d => y(d.value));

          
          const highlight = function(event,d){
            d3v6.select(this)
              .style("stroke", d => "black")
              .style("stroke-width", d => 5);
          }

          const doNotHighlight = function(event,d){
            d3v6.select(this)
              .style("stroke", d => colorScale(d.country))
              .style("stroke-width", d => depthScale(d.country))
          }

          svg.append("g").append("rect")
            .attr("width", width - margin.left)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "ghostwhite")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

          svg.append("g")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
            .call(d3v6.axisBottom(x))
            .style("font-size", "11pt");
          svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(d3v6.axisLeft(y))
            .style("font-size", "11pt");

            filteredData = filteredData.sort((a,b) => {if(get_color(a.country)=="grey")return -1; return 1;})

          svg.selectAll("line_path")
          .data(filteredData)
          .enter().append("path")
            .attr("d", function(d) {
                const beg = Object.values(d).filter(value => !(null == value) && !isNaN(value))[0]
                return line(Object.entries(d).filter(entry => !(null == entry[1]) && !isNaN(entry[1])).map(entry => ({ year: entry[0], value: entry[1], beg: beg})));
            })
             .style("stroke", d => colorScale(d.country))
             .attr("fill", "none")
             .style("stroke-width", d => depthScale(d.country))
             .on("mouseover", highlight)
             .on("mouseleave", doNotHighlight )
             .attr("transform", `translate(${margin.left}, ${margin.top})`) 
            .append("title")
              .text(d => `${ABBREVIATION_TO_COUNTRY[d.country]}`)
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
            console.log(filteredData)
          filteredData = filteredData.filter(d => !("grey" == get_color(d.country) ))

          svg.selectAll("line_text")
            .data(filteredData)
            .enter().append("text")
            .attr("x", function(d) {
                var lastYear = Object.keys(d).filter(year => !(null == d[year]) && !isNaN(d[year])).pop();
                return x(lastYear); 
            })
            .attr("y", function(d) {
                var lastValue = d[Object.keys(d).filter(year => !(null == d[year]) && !isNaN(d[year])).pop()];
                return  y(lastValue) ;
            })
            .text(function(d) {
                return d.country;
            })
            
            .attr("dy", "0.35em") // Adjust vertical alignment if needed
            .style("font-size", "10px") // Adjust font size as needed  
            .attr("fill", "grey") 
            .attr("stroke",  d => colorScale(d.country))
            .attr("stroke-width", ".2px")   
            .attr("transform", `translate(${margin.left}, ${margin.top})`);    
        })

      return;
}

var highlight_countries = 0

init_svg_line_all()
plot_data_years(highlight_countries)


window.addEventListener('resize', function(){
  plot_data_years(highlight_countries);
});