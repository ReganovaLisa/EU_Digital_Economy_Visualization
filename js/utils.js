function getFirstFloatFromString(str) {
    var match = str.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
}

const COUNTRY_GROUPS = {
    green: ["BG", "LV", "EE"],
    red: ["BE", "DK", "DE"],
    purple: ["FI", "MT"],
    grey: [],
}
  
function get_color(country) {
    
    var color = "grey"
    Object.entries(COUNTRY_GROUPS).forEach(entry =>  {
        if (entry[1].includes(country)) {
        color = `${entry[0]}`;
        }
    })
    return color
}