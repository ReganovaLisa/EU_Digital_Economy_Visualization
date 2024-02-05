
function init_svg_heatmapplot() {
    d3v6.select("#heatmap")
    .append("svg")
      .attr("id","heatmap_svg");
}

function getFirstFloatFromString(str) {
var match = str.match(/-?\d+(\.\d+)?/);
return match ? parseFloat(match[0]) : null;
}

function plot_heatmap(highlight_countries) {

    var svg = d3v6.select("#heatmap_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("heatmap_svg").clientWidth;
    const height =  document.getElementById("heatmap_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};


    d3v6.csv(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv").then(function(data) {
           
        svg.append("g").append("rect")
            .attr("width", width - margin.left)
            .attr("height", height - margin.top - margin.bottom)
            //.attr("fill", "white")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

            
            const myGroups = Array.from(new Set(data.map(d => d.group)))
            const myVars = Array.from(new Set(data.map(d => d.variable)))
          
            // Build X scales and axis:
            const x = d3v6.scaleBand()
              .range([ 0, width - margin.left ])
              .domain(myGroups)
              .padding(0.05);
            svg.append("g")
              .style("font-size", 15)
              .attr("transform", `translate(0, ${height - margin.bottom})`)
              .call(d3v6.axisBottom(x).tickSize(0))
              .select(".domain").remove()
          
            // Build Y scales and axis:
            const y = d3v6.scaleBand()
              .range([ height - margin.top - margin.bottom, 0 ])
              .domain(myVars)
              .padding(0.05);
            svg.append("g")
              .style("font-size", 15)
              .attr("transform", `translate(0, ${margin.left})`)
              .call(d3v6.axisLeft(y).tickSize(0))
              .select(".domain").remove()
          
            // Build color scale
            const myColor = d3v6.scaleLinear()
              .range(["white", "#69b3a2"])
              .domain([1,100])
          
            // create a tooltip
            const tooltip = d3v6.select("#heatmap")
              .append("div")
              .style("opacity", 0)
              .attr("class", "tooltip")
              .style("background-color", "white")
              .style("border", "solid")
              .style("border-width", "2px")
              .style("border-radius", "5px")
              .style("padding", "5px")
          
            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function(event,d) {
              tooltip
                .style("opacity", 1)
              d3v6.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
            }
            const mousemove = function(event,d) {
              tooltip
                .html("The exact value of<br>this cell is: " + d.value)
                .style("left", (event.x)/2 + "px")
                .style("top", (event.y)/2 + "px")
            }
            const mouseleave = function(event,d) {
              tooltip
                .style("opacity", 0)
              d3v6.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
            }
          
            // add the squares
            svg.selectAll()
              .data(data, function(d) {return d.group+':'+d.variable;})
              .join("rect")
                .attr("x", function(d) { return x(d.group) })
                .attr("y", function(d) { return y(d.variable) })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", x.bandwidth() )
                .attr("height", y.bandwidth() )
                .style("fill", function(d) { return myColor(d.value)} )
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.7)
              .on("mouseover", mouseover)
              .on("mousemove", mousemove)
              .on("mouseleave", mouseleave)
              .append("title")
              .text('frf')
              .attr("transform", `translate(${margin.left}, ${margin.top})`);

           // Add title to graph
           svg.append("text")
           .attr("x", 0)
           .attr("y", -50)
           .attr("text-anchor", "left")
           .style("font-size", "22px")
           .text("A d3v6.js heatmap");
   
   // Add subtitle to graph
          svg.append("text")
           .attr("x", 0)
           .attr("y", -20)
           .attr("text-anchor", "left")
           .style("font-size", "14px")
           .style("fill", "grey")
           .style("max-width", 400)
           .text("A short description of the take-away message of this chart.");
   

        
          
         
          
    })
    return;
}
  
var highlight_countries = 0

init_svg_heatmapplot()
plot_heatmap(highlight_countries)


window.addEventListener('resize', function(){
plot_heatmap(highlight_countries);
});