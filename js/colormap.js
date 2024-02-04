function Choropleth(data, {
    id = d => d.id, // given d in data, returns the feature id
    value = () => undefined, // given d in data, returns the quantitative value
    title, // given a feature f and possibly a datum d, returns the hover text
    format, // optional format specifier for the title
    scale = d3v7.scaleSequential, // type of color scale
    domain, // [min, max] values; input of color scale
    range = d3v7.interpolateYellows(), // output of color scale
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
    const N = d3v7.map(data, id);
    const V = d3v7.map(data, value).map(d => d == null ? NaN : +d);
    const Im = new d3v7.InternMap(N.map((id, i) => [id, i]));
    const If = d3v7.map(features.features, featureId);
  
    // Compute default domains.
    if (domain === undefined) domain = d3v7.extent(V);
  
    // Construct scales.
    const color = scale(domain, range);


    
    if (color.unknown && unknown !== undefined) color.unknown(unknown);
  
    // Compute titles.
    if (title === undefined) {
      format = color.tickFormat(100, format);
      title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
    } else if (title !== null) {
      const T = title;
      const O = d3v7.map(data, d => d);
      title = (f, i) => T(f, O[i]);
    }
  
    // Compute the default height. If an outline object is specified, scale the projection to fit
    // the width, and then compute the corresponding height.
    // if (height === undefined) {
    //   if (outline === undefined) {
    //     height = 400;
    //   } else {
    //     const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
    //     const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
    //     projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
    //     height = dy;
    //   }
    // }
  
    
  
    const svg = d3v7.create("svg")

    const chartMapContainer = document.getElementById('sevensp');
    chartMapContainer.innerHTML = '';
    chartMapContainer.appendChild(Object.assign(svg.node(), { scales: { color } }));
    width = document.getElementById("sevensp").clientWidth;
    height =  document.getElementById("sevensp").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 60};

    console.log(features.features)
    projection.fitSize([0.85*width- margin.left - margin.right, 0.85*height - margin.bottom - margin.top], borders)

    // Construct a path generator.
    const path = d3v7.geoPath(projection);

    svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");
  
    if (outline != null) svg.append("path")
        .attr("fill", fill)
        .attr("stroke", "currentColor")
        .attr("d", path(outline))
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    svg.append("g")
      .selectAll("path")
      .data(features.features)
      .join("path")
        .attr("fill", (d, i) => color(V[Im.get(If[i])]))
        .attr("d", path)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .append("title")
        .text((d, i) => title(d, Im.get(If[i])))
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    if (borders != null) svg.append("path")
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", path(borders))
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
  
        const legendWidth = 100;
        const legendHeight = 15;
        const legendScale = d3v7.scaleLinear().domain(domain).range([0, legendWidth]);
    
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - margin.right}, ${3})`);
    
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
    
        const legendAxis = d3v7.axisBottom(legendScale)
            .ticks(5)
            .tickSize(legendHeight);
    
        legend.append("g")
            .style('stroke','black')
            .style("stroke-width","0.4")
            .call(legendAxis);
    
        
        return ;
}

function updateMap() {
  Promise.all([
    d3v7.csv("data/europe_skills_two.csv").then(data => data.map(d => ({...d, rate: +d.y_2023}))),
    d3v7.json("data/europe.json"),
  ]).then(([unemployment, us]) => {
    const counties = topojson.feature(us, us.objects.europe);
    const states = topojson.feature(us, us.objects.europe);
    console.log(states);
    const statemap = new Map(states.features.map(d => [d.id, d]));
    console.log(statemap);
    const statemesh = topojson.mesh(us, us.objects.europe, (a, b) => a !== b);
    console.log(statemesh);

    
     // Clear existing map
    const chart_map = Choropleth(unemployment, {
      id: d => d.id,
      value: d => d[sort_order], // Use the selected column as the value
      scale: d3v7.scaleQuantize,
      domain: [0, 100],
      range: d3v7.schemeYlOrBr[9],
      title: (f, d) => ` ${statemap.get(f.id.slice(0, 2)).properties.NAME}\n${d?.[sort_order]}%`,
      width: undefined,
      height: undefined,
      projection: d3v7.geoConicConformal()
        .rotate([-20.0, 0.0])
        .center([0.0, 52.0])
        .parallels([35.0, 65.0])
        .translate([screen.width / 2, screen.width / 5])
        //.scale(700)
        .precision(.1),
      features: states,
      borders: statemesh,
    });
    
  });
}

function plot_map_years(given_country, given_year) {
    updateMap()
    return;
}
  
var sort_order = "y_2023";

plot_map_years(given_country, given_year)

window.addEventListener('resize', function(){
    plot_map_years(given_country, given_year);
});