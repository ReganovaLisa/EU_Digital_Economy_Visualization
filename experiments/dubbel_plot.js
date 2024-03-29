


function callout(g, data){
  let path = g.selectAll("path")
      .data([null])
      .join("path")
      .attr("fill", "white")
      .attr("fill-opacity", 0.8)
      .attr("stroke", "black")
      .attr("stroke-linejoin", "bevel");
  
  let text = g.style("display", "")
      .selectAll("text")
      .data([null])
      .join("text")
  
  text.selectAll("tspan")
   .data(data)
   .join("tspan")
   .attr("x", 20)
   .attr("dy", (d, i)=>i*20)
   .text((d)=>d)
  
  text.select("tspan:first-child").style("font-weight", "600")
  
  let {x,y,width,height} = text.node().getBBox();
  
  let endX = width+25,endY = height;
  
  path.attr("d", `M0 0 L10 -20 L${endX} -20 L${endX} ${endY} L10 ${endY} Z`)
};


function draw_dumbbel() {
    var width = 0.8*window.innerWidth;

    var height = 0.6*width;
    var margin = ({top:20, right:100, bottom:80, left:40});

    d3.json("../data/data_dumbell_ordered.json").then(function(dataset){
      console.log(dataset);
      
      horzScale = d3.scaleBand(dataset.map(d => d[0]), [0, width]).padding(0.95);
      console.log(dataset[0][0]);
      
      
      console.log(width);
      horzAxis = (e)=>e.append("g").classed("x axis", true).call(d3.axisBottom(horzScale)).attr("transform", `translate(0, ${height}) `).selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-30)");
      vertScale = d3.scaleLinear([0, d3.max(dataset, (d)=>(Math.max(d[1].males, d[1].females)))], [height, 0]).nice();
      vertAxisLeft = (e)=>e.append("g").classed("y axis", true).call(d3.axisLeft(vertScale).tickFormat(d3.format("~s"))).select(".domain").remove();
      vertAxisRight = (e)=>e.append("g").classed("y axis right", true).call(d3.axisRight(vertScale).tickFormat(d3.format("~s"))).attr("transform", `translate(${width}, 0)`).select(".domain").remove();
      revenueFormat = d3.format(".2f");
      
      //vertScaleDif = d3.scaleLinear([-5, 9], [1.5*height, 1.1*height]).nice();
      //vertAxisDif = (e)=>e.append("g").classed("y axis", true).call(d3.axisLeft(vertScaleDif).tickFormat(d3.format("~s"))).attr("transform", `translate(0, ${0.01*height}) `).select(".domain").remove();
      //horzScaleDif = d3.scaleBand(differences, [0, width]).padding(0.95);

      var container = d3.select("#chart_dumbbel");

      // Create the SVG element
      var svg = container.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", 1.5*height +2*margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        let barCenter = horzScale.bandwidth() / 2;
        
        let chart = svg.append("g").classed("chart", true).attr("transform", `translate(${margin.left}, ${margin.top})`)
        
        chart.selectAll("rect.bar")
          .data(dataset)
          .join("rect")
          .classed("bar", true)
          .attr("x", (d)=>horzScale(d[0]))
          .attr("y", (d)=>{
            let {males, females} = d[1],
                max = Math.max(males, females);
            
            return vertScale(max);
          })
          .attr("width", horzScale.bandwidth())
          .attr("height", (d)=>{
            let {males, females} = d[1]
            return (height - vertScale(Math.abs(males - females)))
          })
          .attr("fill", "gray")
        
        var popup = null;
        
        chart.selectAll("circle.males")
          .data(dataset)
          .join("circle")
          .classed("males", true)
          .attr("cx", (d)=>(horzScale(d[0])+barCenter))
          .attr("cy", (d)=>(vertScale(d[1].males)))
          .attr("r", 7)
          .attr("fill", "steelblue")
          .style("cursor", "pointer")
          .on("mouseover", function(event, d){
            let x = horzScale(d[0]) + barCenter,
                y = vertScale(d[1].males)
            popup.attr("transform", `translate(${x}, ${y}) rotate(-10)`)
            callout(popup, [`${d[0]}(males)`, revenueFormat(d[1].males) +" %",])
          })
          .on("mouseout", function(){
            popup.style("display", "none")
          })
        
          chart.selectAll("circle.females")
          .data(dataset)
          .join("circle")
          .classed("females", true)
          .attr("cx", (d)=>(horzScale(d[0])+barCenter))
          .attr("cy", (d)=>(vertScale(d[1].females)))
          .attr("r", 7)
          .attr("fill", "red")
          .style("cursor", "pointer")
          .on("mouseover", function(event, d){
            let x = horzScale(d[0]) + barCenter,
                y = vertScale(d[1].females)
            popup.attr("transform", `translate(${x}, ${y}) rotate(-10)`)
            callout(popup, [`${d[0]}(females)`, revenueFormat(d[1].females)])
          })
          .on("mouseout", function(){
            popup.style("display", "none")
          })

          
        chart.call(horzAxis)
        chart.call(vertAxisLeft)
        chart.call(vertAxisRight)
        popup = chart.append("g").classed("popup", true);
        
        
        return svg.node();
      
      
    });
}

draw_dumbbel()