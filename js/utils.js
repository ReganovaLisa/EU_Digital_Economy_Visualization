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
  
const COUNTRY_TO_ABREVIATION = {
    "Luxembourg" : "LU",
    "Ireland" : "IE",
    "Switzerland" : "CH",
    "San Marino" : "SM",
    "Norway" : "NO",
    "Denmark" : "DK",
    "Netherlands" : "NL",
    "Iceland" : "IS",
    "Austria" : "AT",
    "Andorra" : "AD",
    "Sweden" : "SE",
    "Germany" : "DE",
    "Belgium" : "BE",
    "Malta" : "MT",
    "Finland" : "FI",
    "France" : "FR",
    "United Kingdom" : "UK",
    "Italy" : "IT",
    "Cyprus" : "CY",
    "Slovenia" : "SI",
    "Spain" : "ES",
    "Lithuania" : "LT",
    "Czech Republic" : "CZ",
    "Poland" : "PL",
    "Estonia" : "EE",
    "Portugal" : "PT",
    "Hungary" : "HU",
    "Croatia" : "HR",
    "Slovakia" : "SK",
    "Turkey" : "TR",
    "Romania" : "RO",
    "Latvia" : "LV",
    "Greece" : "EL",
    "Russia" : "RU",
    "Bulgaria" : "BG",
    "Montenegro" : "ME",
    "Serbia" : "RS",
    "Belarus" : "BY",
    "Georgia" : "GE",
    "Armenia" : "AM",
    "Bosnia and Herzegovina" : "BA",
    "Albania" : "AL",
    "Azerbaijan" : "AZ",
    "Moldova" : "MD",
    "Kosovo" : "XK",
    "Ukraine" : "UA",
    "North macedonia": "MK"
}

const obj_invertion = (obj) => Object.fromEntries(Object.entries(obj).map(a => a.reverse()))



const ABBREVIATION_TO_COUNTRY = obj_invertion(COUNTRY_TO_ABREVIATION)



function get_color(country) {
    
    var color = "grey"
    Object.entries(COUNTRY_GROUPS).forEach(entry =>  {
        if (entry[1].includes(country)) {
        color = `${entry[0]}`;
        }
    })
    return color
}

const fix_name = (n) =>  n == "UK" ? "GB" : n == "EL" ? "GR" : n;