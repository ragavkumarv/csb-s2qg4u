var year = 0;

var input_year = d3
  .select("#year input")
  .on("change", function () {
    year = +this.value;
    Plot(year);
    let at = geodesic(year, null);
    showOutput(year, at);
  })
  .each(function () {
    year = +this.value;
    Plot(year);
    let at = geodesic(year, null);
    showOutput(year, at);
  });

function showOutput(year, at) {
  let yearOutput = d3.select("output");
  if (year == 2005) {
    yearOutput.text("\nYear = " + year + "\n" + " No Data Found!");
  } else {
    yearOutput.text(
      "\nYear = " +
        year +
        " \nTotal Species Assessed = " +
        at[0] +
        " \nTotal Species Threatened = " +
        at[1]
    );
  }
}
