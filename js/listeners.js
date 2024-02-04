// document.querySelectorAll('input[type="radio"][name="box_form"]').forEach((radioButton) => {
//   radioButton.addEventListener('change', (event) => {
//     if (event.target.checked) {
//       console.log(`Selected: ${event.target.value}`);
//       sort_order = event.target.value;
//       plot_boxplot_years(country_groups[event.target.value]);
//     }
//   });
// });


["float1", "float2", "float3","float_none"].forEach( button_id => {
  const myButton = document.getElementById(button_id);
  myButton.addEventListener("click", function(e) {
    plot_boxplot_years(COUNTRY_GROUPS[myButton.name]);
    plot_alluvial_years(COUNTRY_GROUPS[myButton.name]);
  }, false)
})