//https://developer.tech.yandex.ru/services/3

let objectsData = [];

const dataReqestUrl = "bigPlaceholder.json";

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

  if (dataArray.length === 0) {
    listString = `В данном месте отсуствуют объявления!`;
    searchList.innerHTML = listString;
    return;
  }
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

let uniqueAddresses = [];
let visibleObjects = [];

const mapBlock = document.getElementById("map");

//сформировать уникальные адреса
function getUniqueAddresses(dataArray) {
  uniqueAddresses = [];
  dataArray.forEach((item, index) => {
    const street = item.street;
    const houseNumber = item.houseNumber;
    const objectID = item.id;
    const itemLatitude = item.coordinates.latitude;
    const itemLongitude = item.coordinates.longitude;

    const findAdress = uniqueAddresses.find((uniqueAdress) => {
      return (
        street === uniqueAdress.properties.street &&
        houseNumber === uniqueAdress.properties.houseNumber
      );
    });

    if (findAdress) {
      findAdress.properties.id.push(objectID);
    } else {
      const newAdress = {
        type: "Feature",
        id: index,
        geometry: {
          coordinates: [itemLongitude, itemLatitude],
        },
        properties: {
          street: street,
          houseNumber: houseNumber,
          id: [objectID],
        },
      };
      uniqueAddresses.push(newAdress);
    }
  });
  return uniqueAddresses;
}

let debounceTimeout;

//отфильтровать массив объектов по массиву с ID
function objectsFilterById(idArray) {
  return objectsData.filter((item) => idArray.includes(item.id));
}

//отключить активные (зеленые) маркеры
function clearActiveMarkers() {
  mapBlock
    .querySelectorAll(".marker--active")
    .forEach((item) => item.classList.remove("marker--active"));
}

//обработка изменений карты (масштаб и положение)
function updateHandler() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const visibleId = getVisibleItems(uniqueAddresses);

    visibleObjects = objectsFilterById(visibleId);
    clearActiveMarkers();
    listRender(visibleObjects);
  }, 300);
}

//обработка кликов по карте
function onClickHandler(event) {
  clearActiveMarkers();
  if (!event) {
    if (visibleObjects.length === 0) {
      listRender(objectsData);
    } else {
      listRender(visibleObjects);
    }
    return;
  }

  let activeId = event.entity.properties.id;

  activeId.forEach((item, index) => {
    activeId[index] = +activeId[index];
  });

  event.entity.element.closest(".marker").classList.add("marker--active");
  const activeObjects = objectsFilterById(activeId);

  listRender(activeObjects);
}

//получить видимые маркеры
function getVisibleItems(dataArray) {
  const bounds = map.bounds;
  const latitudeMax = bounds[0][1];
  const latitudeMin = bounds[1][1];
  const longitudeMax = bounds[1][0];
  const longitudeMin = bounds[0][0];

  let result = [];

  dataArray.forEach((item) => {
    const itemLatitude = item.geometry.coordinates[1];
    const itemLongitude = item.geometry.coordinates[0];

    if (
      itemLatitude >= latitudeMin &&
      itemLatitude <= latitudeMax &&
      itemLongitude >= longitudeMin &&
      itemLongitude <= longitudeMax
    ) {
      result = result.concat(item.properties.id);
    }
  });

  return result;
}

//функция для создания обычных маркеров
function marker(feature) {
  const content = document.createElement("section");
  content.classList.add("single-marker", "marker");
  const markerValue =
    feature.properties.id.length > 1 ? feature.properties.id.length : "";
  content.innerHTML = `<div class='marker' data-id='${feature.properties.id}'>${markerValue}<div>`;

  return new ymaps3.YMapMarker(
    {
      source: "my-source",
      coordinates: feature.geometry.coordinates,
      draggable: false,
      properties: {
        id: feature.properties.id,
      },
    },
    content
  );
}

//функция для создания маркеров-кластеров
const cluster = (coordinates, features) => {
  let clusterIds = [];
  features.forEach((item) => {
    clusterIds = clusterIds.concat(item.properties.id);
  });

  let classByCount = ``;
  if (features.length < 11) {
    classByCount = "cluster-10";
  } else if (features.length < 26) {
    classByCount = "cluster-25";
  } else if (features.length < 51) {
    classByCount = "cluster-50";
  } else if (features.length < 101) {
    classByCount = "cluster-100";
  } else if (features.length < 501) {
    classByCount = "cluster-500";
  } else if (features.length < 1001) {
    classByCount = "cluster-1000";
  } else {
    classByCount = "cluster-more-1000";
  }
  const content = document.createElement("section");
  content.classList.add("cluster-marker", "marker", classByCount);
  content.innerHTML = `<div>${clusterIds.length}<div>`;

  return new ymaps3.YMapMarker(
    {
      coordinates,
      source: "my-source",
      properties: {
        id: clusterIds,
      },
    },
    content
  );
};

async function initMap() {
  await ymaps3.ready;

  uniqueAddresses = getUniqueAddresses(objectsData);

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
    YMapListener,
    YMapLayer,
    YMapFeatureDataSource,
  } = ymaps3;

  ymaps3.import.registerCdn("https://cdn.jsdelivr.net/npm/{package}", [
    "@yandex/ymaps3-clusterer@0.0.10",
  ]);

  const { YMapClusterer, clusterByGrid } = await ymaps3.import(
    "@yandex/ymaps3-clusterer"
  );

  map = new YMap(
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
  map.addChild(new YMapFeatureDataSource({ id: "my-source" }));
  map.addChild(
    new YMapLayer({ source: "my-source", type: "markers", zIndex: 1800 })
  );

  const clusterer = new YMapClusterer({
    method: clusterByGrid({ gridSize: 64 }),
    features: uniqueAddresses,
    marker,
    cluster,
    maxZoom: 15,
    minZoom: 10,
  });

  map.addChild(clusterer);

  map.addChild(
    new YMapListener({
      onUpdate: updateHandler,
      onClick: onClickHandler,
    })
  );
}
