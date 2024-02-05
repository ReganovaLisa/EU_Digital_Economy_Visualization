
function init_svg_scatterplot() {
    d3v6.select("#scatter_grouped")
    .append("svg")
      .attr("id","scatter_grouped_svg");
}

function getFirstFloatFromString(str) {
var match = str.match(/-?\d+(\.\d+)?/);
return match ? parseFloat(match[0]) : null;
}

function plot_scatter(highlight_countries) {


    var get_opacity = (name) => {
      if (highlight_countries.length > 0) {
        return highlight_countries.includes(COUNTRY_TO_ABREVIATION[name]) ? 1 : 0.1
      }
      return 1;
    }

    var svg = d3v6.select("#scatter_grouped_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("scatter_grouped_svg").clientWidth;
    const height =  document.getElementById("scatter_grouped_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};


    d3v6.csv(
        "data/scatter_data_grouped.csv").then(function(data) {
           
        svg.append("g").append("rect")
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom)
          .attr("fill", "ghostwhite")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)

            
        const x = d3v6.scaleLinear()
        .domain([0, 1.1*d3v6.max(data, function(d) { return d.ict})])
        .range([ 0,width - margin.left - margin.right ]);
        let x_ref = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${height - margin.bottom/1})`)
            .call(d3v6.axisBottom(x))
            .style("font-size", "11pt");
      // Add Y axis
      const y = d3v6.scaleLinear()
        .domain([0, 1.1*d3v6.max(data, function(d) { return +d.skills})])
        .range([ height- margin.bottom, margin.top]);
      svg.append("g")
      .attr("transform", `translate(${margin.left/1}, ${margin.top/2})`)
      .call(d3v6.axisLeft(y))
      .style("font-size", "11pt");

        // Color scale: give me a specie name, I return a color
  const color = d3v6.scaleOrdinal()
  .domain(["small", "middle", "large" ])
  .range([ "firebrick", "#21908dff", "#F7C00F"])



// Highlight the specie that is hovered
const highlight = function(event,d){

  selected_specie = d.group
  

  d3v6.selectAll(".dot")
    .transition()
    .duration(200)
    .style("fill", "lightgrey")
    .attr("r", 6)

  d3v6.selectAll("." + selected_specie)
    .transition()
    .duration(200)
    .style("fill", color(selected_specie))
    .attr("r", 9)
}

// Highlight the specie that is hovered
const doNotHighlight = function(event,d){
  d3v6.selectAll(".dot")
    .transition()
    .duration(200)
    .style("fill", d => color(d.group))
    .attr("r", 7 )
}

// Add dots
svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
    .attr("class", function (d) { return "dot " + d.group } )
    .attr("cx", function (d) { return x(d.ict); } )
    .attr("cy", function (d) { return y(d.skills); } )
    .attr("r", 7)
    .style("fill", function (d) { return color(d.group) } )
    .style('opacity', d => get_opacity(d.country))
  .on("mouseover", highlight)
  .on("mouseleave", doNotHighlight )
  .append("title")
    .text(d => `${d.country}\nICT in GDP ${d3v6.format(".1f")(d.ict)}%\n${d3v6.format(".1f")(d.skills)}% ${d.group} businesses`)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
          
    })
    return;
}
  
var highlight_countries = []

init_svg_scatterplot()
plot_scatter(highlight_countries)


window.addEventListener('resize', function(){
plot_scatter(highlight_countries);
});