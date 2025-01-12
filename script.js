//https://developer.tech.yandex.ru/services/3

let objectsData = [];

const dataReqestUrl = "listPLaceholder.json";

const searchList = document.querySelector(".search-map__list");

const ymApiKey = "72dc643d-c49d-411a-80c7-c6d5d24d6016";

async function getObjectsData() {
  try {
    const response = await fetch(dataReqestUrl);
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }
    const data = await response.json(); // Преобразуем ответ в JSON
    objectsData = data;
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
}

function listRender(dataArray) {
  let listString = ``;

  dataArray.forEach((item) => {
    const itemString = `<div class="row-mobile mob-cont-obj">
          <div class="mob-obj-mid">
            <a href="6">
              <h2>${item.roomNumber}, ${item.area} м², ${item.street} ${item.houseNumber}</h2>
            </a>
          </div>
        </div>`;
    listString += itemString;
  });

  searchList.innerHTML = listString;
}

async function startPage(params) {
  await getObjectsData();

  listRender(objectsData);
  initMap();
}

startPage();

//yandexMap

async function initMap() {
  // Промис `ymaps3.ready` будет зарезолвлен, когда загрузятся все компоненты основного модуля API
  await ymaps3.ready;

  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
    ymaps3;

  const map = new YMap(
    document.getElementById("map"),

    {
      location: {
        center: [82.92043, 55.030204],
        zoom: 12,
      },
    }
  );

  // Добавляем слой для отображения схематической карты
  map.addChild(new YMapDefaultSchemeLayer());
  map.addChild(new YMapDefaultFeaturesLayer());

  objectsData.forEach((item) => {
    const content = document.createElement("section");
    const marker = new YMapMarker(
      {
        coordinates: [item.coordinates.latitude, item.coordinates.longitude],
        draggable: false,
      },
      content
    );
    map.addChild(marker);
    content.innerHTML = "<div class='marker'><div>";
  });

  // const content = document.createElement("section");

  // // Инициализируйте маркер
  // const marker = new YMapMarker(
  //   {
  //     coordinates: [82.92043, 55.030204],
  //     draggable: true,
  //   },
  //   content
  // );

  // content.innerHTML = "<h1>Э</h1>";

  // Добавьте маркер на карту
  // map.addChild(marker);
}
