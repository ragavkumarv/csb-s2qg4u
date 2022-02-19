const width = 960,
  height = 500;

const velocity = [0.01, 0.005],
  t0 = Date.now();

const projection = d3.geoOrthographic().scale(height / 2 - 10);

const canvas = d3
  .select("#body")
  .append("canvas")
  .attr("width", width)
  .attr("height", height);

const context = canvas.node().getContext("2d");

context.strokeStyle = "#000";
context.lineWidth = 0.5;

let timer;
d3.timer(function () {
  timer = Date.now() - t0;
  projection.rotate([timer * velocity[0], timer * velocity[1]]);
  redraw();
});

let faces = [];

const subdivision = 26;

geodesic(year, null);

function redraw() {
  context.clearRect(0, 0, width, height);

  faces.forEach(function (d) {
    d.polygon[0] = projection(d[0]);
    d.polygon[1] = projection(d[1]);
    d.polygon[2] = projection(d[2]);
    if ((d.visible = d3.polygonArea(d.polygon) > 0)) {
      context.fillStyle = d.fill;
      context.beginPath();
      drawTriangle(d.polygon);
      context.fill();
    }
  });

  context.beginPath();
  faces.forEach(function (d) {
    if (d.visible) {
      drawTriangle(d.polygon);
    }
  });
  context.stroke();
}

function drawTriangle(triangle) {
  context.moveTo(triangle[0][0], triangle[0][1]);
  context.lineTo(triangle[1][0], triangle[1][1]);
  context.lineTo(triangle[2][0], triangle[2][1]);
  context.closePath();
}

function geodesic(year, selectBar) {
  const polyhedron = d3.icosahedron;

  const {
    fungii,
    black_f,
    plants,
    black_p,
    inver,
    black_i,
    ver,
    black_v,
    assessed,
    threatened,
  } = balldata.find((data) => data.year === year);

  let colorArray =
    selectBar == "Plants"
      ? Array(+fungii)
          .fill("white")
          .concat(
            Array(+black_f).fill("white"),
            Array(+plants).fill("forestgreen"),
            Array(+black_p).fill("black"),
            Array(+inver).fill("white"),
            Array(+black_i).fill("white"),
            Array(+ver).fill("white"),
            Array(+black_v).fill("white")
          )
      : selectBar == "Vertebrates"
      ? Array(+fungii)
          .fill("white")
          .concat(
            Array(+black_f).fill("white"),
            Array(+plants).fill("white"),
            Array(+black_p).fill("white"),
            Array(+inver).fill("white"),
            Array(+black_i).fill("white"),
            Array(+ver).fill("darkkhaki"),
            Array(+black_v).fill("black")
          )
      : selectBar == "Invertebrates"
      ? Array(+fungii)
          .fill("white")
          .concat(
            Array(+black_f).fill("white"),
            Array(+plants).fill("white"),
            Array(+black_p).fill("white"),
            Array(+inver).fill("dodgerblue"),
            Array(+black_i).fill("black"),
            Array(+ver).fill("white"),
            Array(+black_v).fill("white")
          )
      : selectBar == "Fungi & protists"
      ? Array(+fungii)
          .fill("orchid")
          .concat(
            Array(+black_f).fill("black"),
            Array(+plants).fill("white"),
            Array(+black_p).fill("white"),
            Array(+inver).fill("white"),
            Array(+black_i).fill("white"),
            Array(+ver).fill("white"),
            Array(+black_v).fill("white")
          )
      : Array(+fungii)
          .fill("mediumorchid")
          .concat(
            Array(+black_f).fill("black"),
            Array(+plants).fill("forestgreen"),
            Array(+black_p).fill("black"),
            Array(+inver).fill("skyblue"),
            Array(+black_i).fill("black"),
            Array(+ver).fill("khaki"),
            Array(+black_v).fill("black")
          );

  faces = polyhedron.polygons(subdivision).map(function (d) {
    d = d.coordinates[0];
    d.pop(); // use an open polygon
    d.fill = colorArray[Math.floor(Math.random() * colorArray.length)];
    d.polygon = d.map(projection);
    return d;
  });

  redraw();
  return [assessed, threatened];
}
