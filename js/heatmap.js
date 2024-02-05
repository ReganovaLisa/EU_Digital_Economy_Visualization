
function init_svg_scatterplot() {
    d3v6.select("#heatmap")
    .append("svg")
      .attr("id","heatmap_svg");
}

function getFirstFloatFromString(str) {
var match = str.match(/-?\d+(\.\d+)?/);
return match ? parseFloat(match[0]) : null;
}

function plot_scatter(highlight_countries) {

    var svg = d3v6.select("#heatmap_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("heatmap_svg").clientWidth;
    const height =  document.getElementById("heatmap_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};


    d3v6.csv(
        "../data/scatter_data_grouped.csv").then(function(data) {
           
        svg.append("g").append("rect")
            .attr("width", width - margin.left)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "white")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

            
        const x = d3v6.scaleLinear()
        .domain([0, 1.1*d3v6.max(data, function(d) { return d.ict})])
        .range([ 0,width - margin.left ]);
        svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
            .call(d3v6.axisBottom(x));
    
      // Add Y axis
      const y = d3v6.scaleLinear()
        .domain([0, 1.3*d3v6.max(data, function(d) { return +d.skills})])
        .range([ height - margin.top - margin.bottom, 0]);
      svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(d3v6.axisLeft(y))

      
      const tooltip = d3v6.select("#heatmap_svg")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

        // Color scale: give me a specie name, I return a color
  const color = d3v6.scaleOrdinal()
  .domain(["small", "middle", "large" ])
  .range([ "#440154ff", "#21908dff", "#fde725ff"])

  console.log(data.group);


// Highlight the specie that is hovered
const highlight = function(event,d){

  selected_specie = d.group
  

  d3v6.selectAll(".dot")
    .transition()
    .duration(200)
    .style("fill", "lightgrey")
    .attr("r", 3)

  d3v6.selectAll("." + selected_specie)
    .transition()
    .duration(200)
    .style("fill", color(selected_specie))
    .attr("r", 7)
}

// Highlight the specie that is hovered
const doNotHighlight = function(event,d){
  d3v6.selectAll(".dot")
    .transition()
    .duration(200)
    .style("fill", d => color(d.group))
    .attr("r", 5 )
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
    .attr("r", 5)
    .style("fill", function (d) { return color(d.group) } )
  .on("mouseover", highlight)
  .on("mouseleave", doNotHighlight )
  

          
    })
    return;
}
  
var highlight_countries = 0

init_svg_scatterplot()
plot_scatter(highlight_countries)


window.addEventListener('resize', function(){
plot_scatter(highlight_countries);
});