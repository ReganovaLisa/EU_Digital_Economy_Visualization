function init_svg_alluvial() {
    d3v6.select("#sixsp")
    .append("svg")
      .attr("id","sixsp_svg");
}

function plot_alluvial_years(group) {

    var svg = d3v3.select("#sixsp_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("sixsp_svg").clientWidth;
    const height =  document.getElementById("sixsp_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 30};

    d3v6.csv("data/alluvial.csv").then(function(data) {
        data = data.filter( d => d.joined_eu != "non_eu")


        var group_coloring = false


        if ( group.length != 0) {
            group_coloring = true;
        }


        



        const graph = {
            "nodes" : [], "links" : []
        };

        function get_gdp_bucket(gdp) {
            var res = "none";
            if (gdp < 40) {
                res = "<40k"
            } else if (gdp < 60) {
                res = "40k-60k"
            } else if (gdp < 80) {
                res = "60k-80k"
            } else {
                res = ">80k"
            }
            return res;
        }


        data.forEach(function (d) {
            graph.nodes.push({ "name": d.id });
            graph.nodes.push({ "name": d.joined_eu });
            graph.nodes.push({ "name": d.geo });
            graph.nodes.push({ "name": get_gdp_bucket(+d.gdp) });
            graph.nodes.push({ "name": get_color(d.id) });

            graph.links.push({ "source": d.id,
                                "target": d.geo,
                                "value": 1,
                            "information": d});
            graph.links.push({ "source": d.geo,
                                "target": d.joined_eu,
                                "value": 1,
                            "information": d});
            graph.links.push({ "source": d.joined_eu,
                                "target": get_gdp_bucket(+d.gdp),
                                "value": 1,
                            "information": d});
            graph.links.push({ "source": get_gdp_bucket(+d.gdp),
                            "target": get_color(d.id),
                            "value": 1,
                        "information": d});
            }
        );
        
        graph.nodes = Array.from(d3v6.group(graph.nodes, d => d.name).keys());
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });

        var color = d3v6.scaleOrdinal()
          .domain(graph.nodes.map(node => node.name).filter(n => (n.length > 2 && !Object.keys(COUNTRY_GROUPS).includes(n))))
          .range(d3v6.schemeSet3);
        
        var my_color_link = (link) => {
            if (group_coloring) {
                return group.includes(link.information.id) ? get_color(link.information.id) : "grey"
            }
            return my_color_rect(link.target.name)}

        var my_color_rect = (name) =>  {
            return Object.keys(COUNTRY_GROUPS).includes(name) ? name : color(name)
        }

        d3v3.sankey(graph)
            .nodeAlign(d3v3.sankeyJustify)
            .nodeWidth(30)
            .nodePadding(1)
            .linkSort((a,b) => {if (a.information.id < b.information.id) return -1; else return 1;})
            .size([width- margin.left - margin.right, height - margin.top - margin.bottom])
            (graph);
        

        svg.selectAll("*").remove();
        svg.append("g").append("rect")
              .attr("width", width - margin.left-margin.right )
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "white")
              .attr("transform", `translate(${margin.left}, ${margin.top})`)

        const opacity_def = 0.4
        
        svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3v3.sankeyLinkHorizontal())
            .attr("stroke", d => my_color_link(d))
            .attr("stroke-opacity", opacity_def)
            .attr("stroke-width", ({width}) => Math.max(1, width))
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .on('mouseover', function (d, i) {
                d3v6.selectAll(".link").filter(other => other.information.id == d.information.id).transition()
                    .duration('50')
                    .attr('stroke-opacity', '1');
           })
           .on('mouseout', function (d, i) {
            d3v6.selectAll(".link").filter(other => other.information.id == d.information.id).transition()
                    .duration('50')
                    .attr('stroke-opacity', opacity_def);
           });
      ;


        const country_nodes = graph.nodes.filter(node => node.name.length == 2)
        const other_nodes =  graph.nodes.filter(node => node.name.length != 2)

        

        svg.append("g")
          .selectAll("flag")
          .data(country_nodes)
          .enter().append("svg:image")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("href",d => `data/flags/w160/${fix_name(d.name).toLowerCase()}.png`)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        svg.append("g")
            .selectAll("rect")
            .data(other_nodes)
            .enter().append("rect")
              .attr("x", d => d.x0)
              .attr("y", d => d.y0)
              .attr("height", d => d.y1 - d.y0)
              .attr("width", d => d.x1 - d.x0)
              .attr("fill", d => my_color_rect(d.name))
              .attr("transform", `translate(${margin.left}, ${margin.top})`)

        var nodeLabelPadding = -10

        svg
            .selectAll("text")
            .data(other_nodes)
            .enter().append("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - 2*nodeLabelPadding)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(d => Object.keys(COUNTRY_GROUPS).includes(d.name) ? GROUP_NAMES[d.name] : d.name)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
    });
    return;
}
  
const group = []
init_svg_alluvial()
plot_alluvial_years([])


window.addEventListener('resize', function(){
    plot_alluvial_years([]);
});