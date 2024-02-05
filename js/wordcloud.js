
function init_svg_wordcloudplot() {
    d3v4.select("#wordcloud")
    .append("svg")
      .attr("id","wordcloud_svg");
}

function getFirstFloatFromString(str) {
var match = str.match(/-?\d+(\.\d+)?/);
return match ? parseFloat(match[0]) : null;
}
var colorRange =["#e1a100",  "#4093cb","#0ec434","#228c68","#8ad8e8","#235b54",
  "#29bdab",
  "#3998f5",
  "#37294f",
  "#277da7",
  "#3750db",
  "#f22020",
  "#991919",
  "#ffcba5",
  "#e68f66",
  "#c56133",
  "#96341c",
  "#632819",
  "#ffc413",
  "#f47a22",
  "#2f2aa0",
  "#b732cc",
  "#772b9d",
  "#f07cab",
  "#d30b94",
  "#407e7b",
  "#c3a5b4",
  "#946aa2",
  "#5d4c86"];
        
function plot_wordcloud(highlight_countries) {

    var svg = d3v4.select("#wordcloud_svg");
    svg.selectAll("*").remove();
       
    const width = document.getElementById("wordcloud_svg").clientWidth;
    const height =  document.getElementById("wordcloud_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};
    d3v6.csv(
      "../data/wordcloud_data.csv").then(function(data) {

           
        svg.append("g").append("rect")
            .attr("width", width - margin.left - margin.right) 
            .attr("height", height - margin.top - margin.right)
            .attr("fill", "ghostwhite")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

            var layout = d3.layout.cloud()
            .size([width- margin.left - margin.right, height- margin.top - margin.right])
            .words(data.map(function(d) { return {text: d.country, size:d[highlight_countries]}; }))
            .padding(5)        //space between words
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return d.size; })      // font size of words
            .on("end", draw);
          layout.start();
          
          
          // This function takes the output of 'layout' above and draw the words
          // Wordcloud features that are THE SAME from one word to the other can be here
          function draw(words) {
            svg
              .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                  .data(words)
                .enter().append("text")
                  .style("font-size", function(d) { return d.size; })
                  .style("fill", function(d,i) { return colorRange[i]; })
                  .attr("text-anchor", "middle")
                  .style("font-family", "Impact")
                  .attr("transform", function(d) {
                    return "translate(" + [d.x + margin.left, d.y + margin.top] + ")rotate(" + d.rotate + ")";
                  })
                  .text(function(d) { return d.text; });
                }   
    
    


          
    })
    return;
}
  
var highlight_countries = 'European Union'

init_svg_wordcloudplot()
plot_wordcloud(highlight_countries)

// Create data = list of groups
var allGroup = ["European Union","Belgium","Bulgaria","Czechia","Denmark","Germany","Estonia","Ireland","Greece","Spain","France","Italy","Latvia","Lithuania","Luxembourg","Hungary","Malta","Netherlands","Austria","Poland","Portugal","Romania","Slovenia","Slovakia","Finland","Sweden","Norway","Switzerland","Bosnia and Herzegovina","Montenegro","Serbia","Turkiye"]

// Initialize the button
var dropdownButton = d3v4.select("#dataviz_builtWithD3")
  .append('select')
  

// add the options to the button
let cloud_options = dropdownButton // Add a button
  .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
 	.data(allGroup)
  .enter()
	.append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; })
  .style("background-color", "#222222");
  


dropdownButton.on("change", function(d) {

    // recover the option that has been chosen
    var selectedOption = d3v4.select(this).property("value")

    // run the updateChart function with this selected option
    plot_wordcloud(selectedOption)
})

window.addEventListener('resize', function(){
plot_wordcloud(highlight_countries);
});