
function init_svg_barplots() {
    d3v6.select("#foursp")
    .append("svg")
      .attr("id","foursp_svg");
  }
  
  function getFirstFloatFromString(str) {
    var match = str.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }
  
  function plot_barplots_years(year_to_plot, highlight_countries) {
  
        var selected_emp_type = "50-249";

        var svg = d3v6.select("#foursp_svg");
        svg.selectAll("*").remove();
          
        const width = document.getElementById("foursp_svg").clientWidth;
        const height =  document.getElementById("foursp_svg").clientHeight;
        const margin =  {top: 30, right: 30, bottom: 50, left: 30};
        const num_multiples = 4;
        const hor_margin = 10;
        const single_width = Math.floor((width - margin.left - margin.right) / 2 - 2 * hor_margin);
        let mid = (width - margin.left - margin.right) / 2

        var get_opacity = (name) => {
            if (highlight_countries.length > 0) {
              return highlight_countries.includes(name) ? 1 : 0.3
            }
            return 0.75;
        }
    
        d3v6.csv(
          "data/estat_isoc_e_dii_filtered_en.csv",
          function(d){
            return {
                country : d["geo"],
                year : +d["TIME_PERIOD"],
                value : d["OBS_VALUE"],
                size_emp : d["size_emp"],
                data_type : d["indic_is"],
            };
          }).then(function(data) {
  
            data = data
                    .filter(d => d["data_type"] != "E_DI3_GELO")
                    .filter(d => d["year"] == year_to_plot)
                    .filter(d => d["size_emp"] == selected_emp_type)
                    .filter(d => (d.country != "EA") && (d.country != "EU27_2020"))


            const data_grouped = d3v6.group(data, d => d.country )
            

            var country_to_it_groups =Array.from(data_grouped.entries()).map(kv => {
                const country = kv[0]
                var high = null;
                var low = null;
                var very_high = null;
                var very_low = null;
                kv[1].forEach(typed_line => {
                    switch (typed_line.data_type.split("_")[2]) {
                        case "VHI":
                            very_high = +typed_line.value;
                            break;
                        case "HI":
                            high = +typed_line.value;
                          break;
                        case "LO":
                            low = +typed_line.value;
                            break;
                        case "VLO":
                            very_low = +typed_line.value;
                            break;
                        default:
                          console.log(`What is ${expr}?`);
                      }
                      
                })
                return {
                    country : country,
                    very_high : very_high, 
                    high : high,
                    low : low,
                    very_low : very_low,
                }
            })
                .filter(el => (el.very_high * el.high * el.low * el.very_low) > 0)



            country_to_it_groups.sort((a, b) => {
                return ( a.very_high + a.high - b.high - b.very_high);
            })


            


            var x = d3v6.scaleLinear()
                .domain([0, d3v6.max(country_to_it_groups, 
                    d => d3v6.max([d.very_high + d.high, d.low + d.very_low]))])
                .range([0, single_width]);

            var x2 = d3v6.scaleLinear()
                .domain([0, d3v6.max(country_to_it_groups, 
                    d => d3v6.max([d.very_high + d.high, d.low + d.very_low]))])
                .range([single_width, 0]);
          
            var y = d3v6.scaleBand()
                .domain(country_to_it_groups.map(el => el.country))
                .range([ height - margin.top - margin.bottom, 0]);


  
            svg.append("g").append("rect")
              .attr("width", width - margin.left - margin.right)
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "white")
              .attr("transform", `translate(${margin.left}, ${margin.top})`)
  

            svg.append("g")
              .attr("transform", `translate(${margin.left + hor_margin}, ${height - margin.bottom})`)
              .call(d3v6.axisBottom(x2).ticks(5));
            
            svg.append("g")
              .attr("transform", `translate(${margin.left + 3*hor_margin + single_width}, ${height - margin.bottom})`)
              .call(d3v6.axisBottom(x).ticks(5));
            
            svg.append("g")
              .attr("transform", `translate(${margin.left}, ${margin.top})`)
              .call(d3v6.axisLeft(y))

              var color = d3v6.scaleOrdinal()
                .domain(['very_low', 'low', 'high', 'very_high'])
                .range(["cyan", "green", "yellow", "orange"])
            
            svg.append("g")
                .selectAll("flag")
                .data(country_to_it_groups)
                .enter().append("svg:image")
                  .attr("x", d => mid - (hor_margin))
                  .attr("y", d => y(d.country))
                  .attr("height", y.bandwidth() - 2)
                  .attr("width", 2*hor_margin)
                  .attr("href",d => `data/flags/w160/${fix_name(d.country).toLowerCase()}.png`)
                  .attr("transform", `translate(${margin.left}, ${margin.top})`)

            Array.from(['very_low', 'low', 'high', 'very_high']).forEach( (intencity,index) => {
                svg.append("text")
                    .attr("text-anchor","middle")
                    .attr("y", height - 1/4*margin.bottom)
                    .attr("x", margin.left + (Math.floor(index/2) + 1/4 + 1/2*(index%2))*(single_width))
                    .style("fill", color(intencity))
                    .text(intencity.replace('_',' '))
                    //.style("fill", color(colName));
                
                let newData = country_to_it_groups
                                .map(row => {return{
                                  "key" : row.country,
                                  "val" : row[intencity],
                                  "offset" : intencity == "very_low" ? 
                                      -row["low"] : intencity == "very_high" ? 
                                      row["high"] : 0,
                                  "self_offset": intencity == "very_low" ? 
                                  row["very_low"] : intencity == "low" ? 
                                  row["low"] : 0
                                }});
                
                let sign = index > 1 ? 1 : -1
                
                svg.selectAll("bars_mult")
                    .data(newData, d => d)
                    .enter().append("rect")
                      .style("fill", color(intencity))
                      .style('opacity', d => get_opacity(d.key))
                      .attr("y", d => y(d.key))
                      .attr("x", d => mid + sign * (hor_margin) + x(d.offset) - x(d.self_offset))
                      //.attr("x", d => 0.5*hor_margin + (index)*(single_width + hor_margin))
                      .attr("width", d => x(d.val))
                      .attr("height", y.bandwidth() - 2)
                      .attr("transform", `translate(${margin.left}, ${margin.top})`)
                    .append("title")
                      .text(d => `${ABBREVIATION_TO_COUNTRY[d.key]} : ${d3v6.format(".1f")(d.val)}% enterprises with\n${intencity.replace('_',' ')} digital intencity index`)
                      .attr("transform", `translate(${margin.left}, ${margin.top})`);
            })
  

                  
          })
  
        return;
  }
  
  var highlight_countries = []
  var year_to_plot = 2023
  var plot_barplots_years_ = (countries) => plot_barplots_years(2023, countries)
  init_svg_barplots()

  plot_barplots_years_([])
  
  
  window.addEventListener('resize', function(){
    plot_barplots_years_([])
  });