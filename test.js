const coordinates = [
  [37.64, 55.76],
  [37.63, 55.7],
  [37.43, 55.69],
  [37.47, 55.68],
  [38.53, 58.6],
  [37.59, 55.71],
  [37.5, 55.63],
  [37.52, 55.57],
  [37.52, 58.57],
  [40.52, 58.57],
];

const points = coordinates.map((lnglat, i) => ({
  type: "Feature",
  id: i,
  geometry: { coordinates: lnglat },
  properties: { name: "Point of issue of orders" },
}));

console.log(points);
