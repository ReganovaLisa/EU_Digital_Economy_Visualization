// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/choropleth

function Choropleth(data, {
    id = d => d.id, // given d in data, returns the feature id
    value = () => undefined, // given d in data, returns the quantitative value
    title, // given a feature f and possibly a datum d, returns the hover text
    format, // optional format specifier for the title
    scale = d3.scaleSequential, // type of color scale
    domain, // [min, max] values; input of color scale
    range = d3.interpolateYellows(), // output of color scale
    width = screen.width, // outer width, in pixels
    height, // outer height, in pixels
    projection, // a d3 projection; null for pre-projected geometry
    features, // a GeoJSON feature collection
    featureId = d => d.id, // given a feature, returns its id
    borders, // a GeoJSON object for stroking borders
    outline = projection && projection.rotate ? {type: "Sphere"} : null, // a GeoJSON object for the background
    unknown = "#343634", // fill color for missing data
    fill = "white", // fill color for outline
    stroke = "white", // stroke color for borders
    strokeLinecap = "round", // stroke line cap for borders
    strokeLinejoin = "round", // stroke line join for borders
    strokeWidth, // stroke width for borders
    strokeOpacity, // stroke opacity for borders
  } = {}) {
    // Compute values.
    const N = d3.map(data, id);
    const V = d3.map(data, value).map(d => d == null ? NaN : +d);
    const Im = new d3.InternMap(N.map((id, i) => [id, i]));
    const If = d3.map(features.features, featureId);
  
    // Compute default domains.
    if (domain === undefined) domain = d3.extent(V);
  
    // Construct scales.
    const color = scale(domain, range);


    
    if (color.unknown && unknown !== undefined) color.unknown(unknown);
  
    // Compute titles.
    if (title === undefined) {
      format = color.tickFormat(100, format);
      title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
    } else if (title !== null) {
      const T = title;
      const O = d3.map(data, d => d);
      title = (f, i) => T(f, O[i]);
    }
  
    // Compute the default height. If an outline object is specified, scale the projection to fit
    // the width, and then compute the corresponding height.
    if (height === undefined) {
      if (outline === undefined) {
        height = 400;
      } else {
        const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
        const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
        projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
        height = dy;
      }
    }
  
    // Construct a path generator.
    const path = d3.geoPath(projection);
  
    const svg = d3.create("svg")

    const chartMapContainer = document.getElementById('chart_map');
    chartMapContainer.appendChild(Object.assign(svg.node(), { scales: { color } }));
    const width = document.getElementById("chart_map").clientWidth;
    const height =  document.getElementById("chart_map").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};

    svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");
  
    if (outline != null) svg.append("path")
        .attr("fill", fill)
        .attr("stroke", "currentColor")
        .attr("d", path(outline));
  
    svg.append("g")
      .selectAll("path")
      .data(features.features)
      .join("path")
        .attr("fill", (d, i) => color(V[Im.get(If[i])]))
        .attr("d", path)
      .append("title")
        .text((d, i) => title(d, Im.get(If[i])));
  
    if (borders != null) svg.append("path")
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", path(borders));

    
  
        const legendWidth = 0.2*975;
        const legendHeight = 20;
        const legendScale = d3.scaleLinear().domain(domain).range([0, legendWidth]);
    
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - 0.1*width}, ${0})`);
    
        const legendGradient = legend.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
    
        legendGradient.selectAll("stop")
            .data(range.map((color, i) => ({ offset: i / (range.length - 1), color })))
            .enter().append("stop")
            .attr("offset", d => `${d.offset * 100}%`)
            .attr("stop-color", d => d.color);
    
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");
    
        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickSize(legendHeight)
            .tickFormat(d3.format("~s"));
    
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);
    
        
        return ;
}

function updateMap() {
  Promise.all([
    d3.csv("../map/data/europe_skills_two.csv").then(data => data.map(d => ({...d, rate: +d.y_2023}))),
    d3.json("../map/data/europe.json"),
  ]).then(([unemployment, us]) => {
    const counties = topojson.feature(us, us.objects.europe);
    const states = topojson.feature(us, us.objects.europe);
    console.log(states);
    const statemap = new Map(states.features.map(d => [d.id, d]));
    console.log(statemap);
    const statemesh = topojson.mesh(us, us.objects.europe, (a, b) => a !== b);
    console.log(statemesh);

    
    chartMapContainer.innerHTML = ''; // Clear existing map
    const chart_map = Choropleth(unemployment, {
      id: d => d.id,
      value: d => d[sort_order], // Use the selected column as the value
      scale: d3.scaleQuantize,
      domain: [0, 100],
      range: d3.schemeYlOrBr[9],
      title: (f, d) => ` ${statemap.get(f.id.slice(0, 2)).properties.NAME}\n${d?.[sort_order]}%`,
      width: screen.width,
      height: 0.6 * screen.width,
      projection: d3.geoConicConformal()
        .rotate([-20.0, 0.0])
        .center([0.0, 52.0])
        .parallels([35.0, 65.0])
        .translate([screen.width / 2, screen.width / 5])
        .scale(700)
        .precision(.1),
      features: states,
      borders: statemesh,
    });
    
  });
}

var sort_order = "y_2023";

// document.querySelectorAll('input[type="radio"][name="sortorder"]').forEach((radioButton) => {
//   radioButton.addEventListener('change', (event) => {
//     if (event.target.checked) {
//       console.log(`Selected: ${event.target.value}`);
//       sort_order = event.target.value;
//       updateMap();
//     }
//   });
// });

// Promise.all([
//   d3.csv("../map/data/europe_skills_two.csv").then(data => data.map(d => ({...d, rate: +d.y_2023}))),
//   d3.json("../map/data/europe.json"),
// ]).then(([unemployment, us]) => {
//   const counties = topojson.feature(us, us.objects.europe);
//   const states = topojson.feature(us, us.objects.europe);
//   console.log(states);
//   const statemap = new Map(states.features.map(d => [d.id, d]));
//   console.log(statemap);
//   const statemesh = topojson.mesh(us, us.objects.europe, (a, b) => a !== b);
//   console.log(statemesh);

  // const chart_map = Choropleth(unemployment, {
  //   id: d => d.id,
  //   value: d => d[sort_order],
  //   scale: d3.scaleQuantize,
  //   domain: [0, 100],
  //   range: d3.schemeYlOrBr[9],
  //   title: (f, d) => ` ${statemap.get(f.id.slice(0, 2)).properties.NAME}\n${d?.[sort_order]}%`,
  //   //projection:d3.geoAlbers(),
  //   width: screen.width,
  //   height: 0.6*screen.width,
  //   projection: d3.geoConicConformal()
  //   .rotate([-20.0, 0.0])
  //   .center([0.0, 52.0])
  //   .parallels([35.0, 65.0])
  //   .translate([screen.width / 2, screen.width / 5])
  //   .scale(700)
  //   .precision(.1),
  //   features: states,
  //   borders: statemesh,
    
  // });
  // console.log(chart_map);
// const chartMapContainer = document.getElementById('chart_map');
//  chartMapContainer.appendChild(chart_map);
updateMap();

// });