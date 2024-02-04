
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
        "../data/scatter_data.csv").then(function(data) {
           
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
        .domain([0, 1.3*d3v6.max(data, function(d) { return +d.large})])
        .range([ height - margin.top - margin.bottom, 0]);
      svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(d3v6.axisLeft(y))

        console.log(d3v6.max(data, function(d) { return +d.large}));
        const tooltip = d3v6.select("#scatter_svg")
        .append("div")
        .style("opacity", 0.5)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

        const mouseover = function(event, d) {
            tooltip
              .style("opacity", 1)
          }
        
          const mousemove = function(event, d) {
            tooltip
              .html(`The exact value of<br>the Ground Living area is: ${d[buisness_size]}`)
              .style("left", (event.x)/2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
              .style("top", (event.y)/2 + "px")
          }
        
          // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
          const mouseleave = function(event,d) {
            tooltip
              .transition()
              .duration(200)
              .style("opacity", 0)
          }
        
          // Add dots
          svg.append('g')
            .selectAll("dot")
            .data(data.filter(function(d,i){return i<100})) // the .filter part is just to keep a few dots on the chart, not all of them
            .enter()
            .append("circle")
              .attr("cx", function (d) { return x(d.ict); } )
              .attr("cy", function (d) { return y(d.small); } )
              .attr("r", 5)
              .style("fill", "green")
              .style("opacity", 0.5)
              .style("stroke", "blue")
            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )

            svg.append('g')
            .selectAll("dot")
            .data(data.filter(function(d,i){return i<100})) // the .filter part is just to keep a few dots on the chart, not all of them
            .enter()
            .append("circle")
              .attr("cx", function (d) { return x(d.ict); } )
              .attr("cy", function (d) { return y(d.middle); } )
              .attr("r", 5)
              .style("fill", "blue")
              .style("opacity", 0.5)
              .style("stroke", "blue")
            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )
    

            svg.append('g')
            .selectAll("dot")
            .data(data.filter(function(d,i){return i<100})) // the .filter part is just to keep a few dots on the chart, not all of them
            .enter()
            .append("circle")
              .attr("cx", function (d) { return x(d.ict); } )
              .attr("cy", function (d) { return y(d.large); } )
              .attr("r", 5)
              .style("fill", "red")
              .style("opacity", 0.5)
              .style("stroke", "blue")
            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )
    
    


          
    })
    return;
}
  
var highlight_countries = 0

init_svg_scatterplot()
plot_scatter(highlight_countries,"small")


window.addEventListener('resize', function(){
plot_scatter(highlight_countries,"small");
});