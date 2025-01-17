let objectsData;
let newObject = [];
async function getObjectsData() {
  try {
    const response = await fetch("street.json");
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }
    const data = await response.json(); // Преобразуем ответ в JSON
    objectsData = data;
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

async function startPage(params) {
  await getObjectsData();
  console.log(objectsData);

  objectsData.forEach((item, index) => {
    newObject.push({
      roomNumber: `${getRandomInt(1, 10)}-к`,
      id: index,
      area: getRandomInt(14, 300),
      street: item,
      houseNumber: getRandomInt(1, 100),
      coordinates: {
        latitude: getRandomFloat(54.96112105861, 55.09916753),
        longitude: getRandomFloat(82.79219895, 83.04866104858),
      },
    });
  });
  console.log(newObject);
}

startPage();
