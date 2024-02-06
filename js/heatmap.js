
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
    const margin =  {top: 30, right: 30, bottom: 60, left: 120};

    const name_mapping = {
      "Persons with ICT education" : 
          "ICT education",
      "Individuals lost information as a result of a virus programs" : 
          "Virus SW victims",
      "Individuals use a smartphone" : 
          "Smartphone usage",
      "Enterprises that provided training to develop/upgrade ICT skills of their personnel " :
          "Firms ICT-trainings",
      "Individuals - internet use" : 
          "Internet usage",
      "Had online purchase in the last 3 months" : 
          "Online purchases",
      "Percentage of ICT sector in GDP" : 
          "ICT sector % in GDP",
      "Percentage of the ICT personnel in total employment" : 
          "ICT personel %",
      "Employed ICT specialists" : 
          "ICT specialists",
      "Enterprises that recruited or tried to recruit ICT specialists" : 
          "ICT recrutement"
    }

    d3v6.csv(
        "data/correlation_matrix.csv").then(function(data) {
           
        svg.append("g").append("rect")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "white")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

            
            const myGroups = Array.from(new Set(data.map(d => d.Column_one)))
            const myVars = Array.from(new Set(data.map(d => d.Column_two)))
          
            // Build X scales and axis:
            const x = d3v6.scaleBand()
              .range([ 0, width - margin.left- margin.right ])
              .domain(myGroups)
              .padding(0.05);
            let x_scale = svg.append("g")
              .attr("font-size", "10px")
              .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
              .call(d3v6.axisBottom(x).tickSize(0));
            
            x_scale.selectAll("text")
              .text(d => {console.log(d, name_mapping[d]); return name_mapping[d]})
              .style("text-anchor", "end")
              .attr("transform", `rotate(-20) translate(${0}, ${0})`)
              .attr("opacity",1)
              // .attr("transform", `translate(${margin.left}, ${margin.top})`)
          
            // Build Y scales and axis:
            const y = d3v6.scaleBand()
              .range([ height - margin.bottom, margin.top ])
              .domain(myVars)
              .padding(0.05);

            let y_scale = svg.append("g")
              .style("font-size", 5)
              .attr("transform", `translate(${margin.left}, ${0})`)
              .call(d3v6.axisLeft(y).tickSize(0))
            y_scale.selectAll("text")
                .text(d => {console.log(d, name_mapping[d]); return name_mapping[d]})
                .attr("font-size", "10px")
                .attr("transform", `rotate(0) translate(${0}, ${0})`)
          
            // Build color scale
            const myColor = d3v6.scaleLinear()
              .range(["white", "orange"])
              .domain([-0,1])
          
            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function(event,d) {
              d3v6.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
            }
            const mouseleave = function(event,d) {
              d3v6.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
            }
          
            // add the squares
            svg.selectAll()
              .data(data, function(d) {return d.Column_one+':'+d.Column_two;})
              .join("rect")
                .attr("x", function(d) { return x(d.Column_one) })
                .attr("y", function(d) { return y(d.Column_two) })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", x.bandwidth() )
                .attr("height", y.bandwidth() )
                .style("fill", function(d) { return myColor(Math.abs(d.Correlation))} )
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8)
              .attr("transform", `translate(${margin.left}, ${0})`)
              .on("mouseover", mouseover)
              .on("mouseleave", mouseleave)
              .append("title")
               .text(d => `${d.Column_one}\nand\n${d.Column_two}\ncorreleation ${d3v6.format(".1f")(d.Correlation)}`)
              .attr("transform", `translate(${margin.left}, ${margin.top})`);         
    })
    return;
}
  
var highlight_countries = 0

init_svg_heatmapplot()
plot_heatmap(highlight_countries)


window.addEventListener('resize', function(){
plot_heatmap(highlight_countries);
});