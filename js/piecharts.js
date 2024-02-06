
function init_svg_piechart() {
    d3v6.select("#fivesp")
    .append("svg")
      .attr("id","fivesp_svg");
}

function getFirstFloatFromString(str) {
    var match = str.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
}

function plot_piecharts_years(given_country, given_year) {

    var svg = d3v6.select("#fivesp_svg");
    svg.selectAll("*").remove();
        
    const width = document.getElementById("fivesp_svg").clientWidth;
    const height =  document.getElementById("fivesp_svg").clientHeight;
    const margin =  {top: 30, right: 30, bottom: 60, left: 30};

    const outer_r = (height - margin.top - margin.bottom) / 5;
    const inner_r = outer_r * 0.4;

    Promise.all([
        d3v6.tsv("data/estat_isoc_sks_itsp_sex.tsv"),
        d3v6.tsv("data/estat_isoc_sks_itsp_ed.tsv"),
        d3v6.tsv("data/estat_isoc_sks_itsp_age.tsv"),
    ]).then(function(files) {
        const data_sex = files[0].map(row => {
            var country = row["freq,unit,sex,geo\\TIME_PERIOD"];
            var countryParts = country.split(",");
            row["country"] = countryParts[countryParts.length - 1].trim();
            delete row["freq,unit,sex,geo\\TIME_PERIOD"];
            
            for (var year in row) {
                if (year !== "country") {
                    row[getFirstFloatFromString(year)] = getFirstFloatFromString(row[year]);
                    delete row[year]
                }
            }
            row["unit"] = countryParts[1].trim()
            row["gender"] = countryParts[2].trim();
            return row;
        }).filter(row => (row['country'] == given_country) && (row['unit'] == "PC") )

        const data_ed = files[1].map(row => {
            var country = row["freq,unit,isced11,geo\\TIME_PERIOD"];
            var countryParts = country.split(",");
            row["country"] = countryParts[countryParts.length - 1].trim();
            delete row["freq,unit,isced11,geo\\TIME_PERIOD"];
            
            for (var year in row) {
                if (year !== "country") {
                    row[getFirstFloatFromString(year)] = getFirstFloatFromString(row[year]);
                    delete row[year]
                }
            }
            row["unit"] = countryParts[1].trim()
            row["ed_years"] = countryParts[2].trim();
            return row;
        }).filter(row => (row['country'] == given_country) && (row['unit'] == "PC"))

        const data_age = files[2].map(row => {
            var country = row["freq,unit,age,geo\\TIME_PERIOD"];
            var countryParts = country.split(",");
            row["country"] = countryParts[countryParts.length - 1].trim();
            delete row["freq,unit,age,geo\\TIME_PERIOD"];
            
            for (var year in row) {
                if (year !== "country") {
                    row[getFirstFloatFromString(year)] = getFirstFloatFromString(row[year]);
                    delete row[year]
                }
            }
            row["unit"] = countryParts[1].trim()
            row["age"] = countryParts[2].trim();
            return row;
        }).filter(row => (row['country'] == given_country) && (row['unit'] == "PC"))
        

        const plot_sex = data_sex.map(row => {return {key: row["gender"], val: row[given_year]}})
        const plot_ed = data_ed.map(row => {return {key: row["ed_years"], val: row[given_year]}})
        const plot_age = data_age.map(row => {return {key: row["age"], val: row[given_year]}})

        const color = d3v6.scaleOrdinal()
            .domain(["M", "F" ,"ED0-4", "ED5-8", "Y15-34", "Y35-74"])
            .range(["#4093CB", "#ffeedd", "#E9D78E", "#F7C00F", "#D1D7B9", "#08513E"])
        
        const pie = d3v6.pie()
            .value(d=>d[1].val)


        const data_ready_sex = pie(Object.entries(plot_sex))
        const data_ready_ed = pie(Object.entries(plot_ed))
        const data_ready_age = pie(Object.entries(plot_age))

        svg.append("g").append("rect")
              .attr("width", width - margin.left - margin.right )
              .attr("height", height - margin.top - margin.bottom)
              .attr("fill", "ghostwhite")
              .attr("transform", `translate(${margin.left}, ${margin.top})`)

        svg.append("text")
              .attr("text-anchor","middle")
              .attr("y", 0)
              .attr("x", 0)
              .style("fill", "black")
              .text("SEX")
              //.style("font-size", "14pt")
              .attr("transform", `translate(${
                margin.left + (width - margin.left - margin.right)/2
            }, ${margin.top + (height- margin.top - margin.bottom)*0.7})`)

        svg.append("text")
            .attr("text-anchor","middle")
            .attr("y", 0)
            .attr("x", 0)
            .style("fill", "black")
            .text("AGE")
            //.style("font-size", "14pt")
            .attr("transform", `translate(${
                margin.left + (width - margin.left - margin.right)*0.23
            }, ${margin.top + (height- margin.top - margin.bottom)*0.3})`)
        
        svg.append("text")
            .attr("text-anchor","middle")
            .attr("y", 0)
            .attr("x", 0)
            .style("fill", "black")
            .text("EDU")
           // .style("font-size", "14pt")
            .attr("transform", `translate(${
                margin.left + (width - margin.left - margin.right)*0.77
            }, ${margin.top + (height- margin.top - margin.bottom)*0.3})`)

        svg.selectAll('gender')
            .data(data_ready_sex)
            .join('path')
            .attr('d', d3v6.arc()
                .innerRadius(inner_r)         // This is the size of the donut hole
                .outerRadius(outer_r)
            )
            .attr('fill', d => color(d.data[1].key))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
            .attr("transform", `translate(${
                margin.left + (width - margin.left - margin.right)/2
            }, ${margin.top + (height- margin.top - margin.bottom)*0.7})`)
        .append("title")
        .text(d => `${d3v6.format(".1f")(d.data[1].val)}% ${d.data[1].key == "M" ? "male" : "female" } `)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


        svg.selectAll('age')
            .data(data_ready_age)
            .join('path')
                .attr('d', d3v6.arc()
                    .innerRadius(inner_r)         // This is the size of the donut hole
                    .outerRadius(outer_r)
                )
                .attr('fill', d => color(d.data[1].key))
                .attr("stroke", "black")
                .style("stroke-width", "2px")
                .style("opacity", 0.7)
                .attr("transform", `translate(${
                    margin.left + (width - margin.left - margin.right)*0.23
                }, ${margin.top + (height- margin.top - margin.bottom)*0.3})`)
            .append("title")
                .text(d => `${d3v6.format(".1f")(d.data[1].val)}% ${d.data[1].key.substring(1,9)} years`)
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

        svg.selectAll('ed')
            .data(data_ready_ed)
            .join('path')
                .attr('d', d3v6.arc()
                    .innerRadius(inner_r)         // This is the size of the donut hole
                    .outerRadius(outer_r)
                )
                .attr('fill', d => color(d.data[1].key))
                .attr("stroke", "black")
                .style("stroke-width", "2px")
                .style("opacity", 0.7)
                .attr("transform", `translate(${
                    margin.left + (width - margin.left - margin.right)*0.77
                }, ${margin.top + (height- margin.top - margin.bottom)*0.3})`)
            .append("title")
                .text(d => `${d3v6.format(".1f")(d.data[1].val)}% High education : ${d.data[1].key == "NRP" ? "no answer" : d.data[1].key.substring(2,6) + " years"}`)
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

    })


    return;
}
  
var given_country = "BE"
var given_year = 2022

var plot_piecharts_years_ = (country) => plot_piecharts_years(country, 2022)

init_svg_piechart()
plot_piecharts_years_(given_country)


window.addEventListener('resize', function(){
    plot_piecharts_years_(given_country);
});

var allGroup = ["Belgium","Bulgaria","Denmark","Germany","Estonia","Ireland","Greece","Spain","France","Italy","Latvia","Lithuania","Luxembourg","Hungary","Malta","Netherlands","Austria","Poland","Portugal","Romania","Slovenia","Slovakia","Finland","Sweden","Norway","Switzerland","Serbia"]

// Initialize the button
var dropdownButton = d3v4.select("#dataviz_drop_pie")
  .append('select')
  

let pie_options = dropdownButton
  .selectAll('myOptions')
 	.data(allGroup)
  .enter()
	.append('option')
  .text(function (d) { return d; })
  .attr("value", function (d) { return d; })
  .style("background-color", "#222222");
  
function dropdown_highlight(dd_options, countries) {
    
    if (countries.length > 0) {
        dd_options
            .style("background-color", el => {
                return countries.includes(COUNTRY_TO_ABREVIATION[el]) ?
                 get_color(COUNTRY_TO_ABREVIATION[el]) : "#222222";});
    } else {
        dd_options
            .style("background-color", "#222222");
    }   
}


dropdownButton.on("change", function(d) {
    // recover the option that has been chosen
    console.log(d3v4.select(this).property("value"))
    
    var selectedOption = d3v4.select(this).property("value")

    plot_piecharts_years_(COUNTRY_TO_ABREVIATION[selectedOption])
    // run the updateChart function with this selected option
    // plot_wordcloud(selectedOption)
})
