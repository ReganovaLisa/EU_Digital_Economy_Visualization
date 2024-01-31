
function init_svg_line_all() {
  d3v6.select("#twosp")
  .append("svg")
    .attr("id","twosp_svg");
}

function getFirstFloatFromString(str) {
  var match = str.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function plot_data_years(highlight_countries) {

      var svg = d3v6.select("#twosp_svg");
      svg.selectAll("*").remove();
      //svg.append("g").attr("transform", `translate(0, 0)`);
        
      const width = document.getElementById("twosp_svg").clientWidth;
      const height =  document.getElementById("twosp_svg").clientHeight; //Math.floor(width * 0.75);
      const margin =  {top: 30, right: 30, bottom: 30, left: 30};

      var regex = /[+-]?\d+(\.\d+)?/g;


      d3v6.tsv(
        "data/estat_tin00074.tsv",
        function(d){
            function parseNumeric(value) {
              // If the value is a number, return it as a float, otherwise return NaN
              return isNaN(value) ? NaN : parseFloat(value);
          }
          var country = d["freq,nace_r2,geo\\TIME_PERIOD"];
          var countryParts = country.split(",");
          d["country"] = countryParts[countryParts.length - 1].trim();
          delete d["freq,nace_r2,geo\\TIME_PERIOD"];
          // Iterate over the years and convert numeric values to floats
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
            return numericValuesCount >= 2;
          }).filter(el => el.ICT == "ICT");


          const x = d3v6.scalePoint()
            .domain(Object.keys(filteredData[0]).filter(function(value) { return !isNaN(value);}))
            .range([0, width - margin.left - margin.right]);
          const y = d3v6.scaleLinear()
            .domain([0, 
            d3v6.max(filteredData, d => d3v6.max(Object.values(d).filter(function(value) { return !isNaN(value);})) )])
            .range([ height - margin.top - margin.bottom, 0]);

          
          var colorScale = d3v6.scaleOrdinal()
            .domain(filteredData.map(el => el.country))
            .range(filteredData.map(el => "hsl(" + Math.random() * 360 + ",100%,50%)"));

          var depthScale = d3v6.scaleOrdinal()
            .domain(filteredData.map(el => el.country))
            .range(filteredData.map(el => {if (el.country == "UK") return 5; else return 1;}));
          

          const step = 5

          var line = d3v6.line()
            .x(d => x(d.year))
            .y(d => y(d.value) - y(d.beg) + height - step * margin.bottom);

          svg.append("g").append("rect")
            .attr("width", width - margin.left)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "white")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

          svg.append("g")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
            .call(d3v6.axisBottom(x));
          svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(d3v6.axisLeft(y))


          var filteredData_ = filteredData
          console.log(filteredData_)

          // console.log(filteredData_.map(d => timeScale(d.year)));
          // console.log(filteredData_.map(d => yScale(d.value)));

          svg.selectAll("line_path")
          .data(filteredData_)
          .enter().append("path")
            .attr("d", function(d) {
                const beg = Object.values(d).filter(value => !(null == value) && !isNaN(value))[0]
                return line(Object.entries(d).filter(entry => !(null == entry[1]) && !isNaN(entry[1])).map(entry => ({ year: entry[0], value: entry[1], beg: beg})));
            })
             .attr("stroke", d => colorScale(d.country))//colorScale(d.country))
             .attr("fill", "none")
             .style("stroke-width", d => depthScale(d.country))//depthScale(d.country))
             .attr("transform", `translate(${margin.left}, ${margin.top})`);

          svg.selectAll("line_text")
            .data(filteredData_)
            .enter().append("text")
            .attr("x", function(d) {
                //console.log(d)
                // x-coordinate based on the most right year position
                var lastYear = Object.keys(d).filter(year => !(null == d[year]) && !isNaN(d[year])).pop();
                //console.log(lastYear)
                return x(lastYear); // Adjust the offset as needed
            })
            .attr("y", function(d) {
                // y-coordinate based on the most right numeric value
                var lastValue = d[Object.keys(d).filter(year => !(null == d[year]) && !isNaN(d[year])).pop()];
                const beg = Object.values(d).filter(value => !(null == value) && !isNaN(value))[0]
                return  y(lastValue) - y(beg) + height - step * margin.bottom;
            })
            .text(function(d) {
                // Display the country name
                return d.country;
            })
            .attr("stroke",  d => colorScale(d.country))
            .attr("dy", "0.35em") // Adjust vertical alignment if needed
            .style("font-size", "10px") // Adjust font size as needed
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

            svg.append("g").append("rect")
            .attr("width", width - margin.left - margin.right)
            .attr("height", 5)
            .attr("fill", "black")
            .attr("transform", `translate(${margin.left}, ${height - step * margin.bottom + margin.top})`)
                
        })

      return;
}

var highlight_countries = 0

init_svg_line_all()
plot_data_years(highlight_countries)


window.addEventListener('resize', function(){
  plot_data_years(highlight_countries);
});