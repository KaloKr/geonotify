const locationBtn = document.getElementById("locationBtn");
const myLocationBtn = document.getElementById("myLocationBtn");
const mapBtn = document.getElementById("mapBtn");

const latitudeEl = document.getElementById("latitude");
const longitudeEl = document.getElementById("longitude");
const accuracyEl = document.getElementById("accuracy");
const addressEl = document.getElementById("address");
const statusEl = document.getElementById("status");

let currentLat = null;
let currentLon = null;

locationBtn.addEventListener("click", getLocation);
myLocationBtn.addEventListener("click", openMyLocation);
mapBtn.addEventListener("click", openNearbyRestaurants);

function showNotification(title, body) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "https://cdn-icons-png.flaticon.com/512/684/684908.png"
    });
  }
}

function getLocation() {
  if (!("geolocation" in navigator)) {
    statusEl.textContent = "Този браузър не поддържа Geolocation.";
    return;
  }

  statusEl.textContent = "Опит за получаване на локация...";
  addressEl.textContent = "—";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      currentLat = latitude;
      currentLon = longitude;

      latitudeEl.textContent = latitude.toFixed(6);
      longitudeEl.textContent = longitude.toFixed(6);
      accuracyEl.textContent = `${accuracy.toFixed(2)} метра`;
      statusEl.textContent = "Локацията е засечена успешно.";

      if ("Notification" in window && Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.error("Грешка при искане на разрешение за известия:", error);
        }
      }

      showNotification(
        "GeoNotify",
        `Локацията е засечена: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      );

      getAddress(latitude, longitude);
    },
    (error) => {
      if (error.code === 1) {
        statusEl.textContent =
          "Достъпът до локацията е отказан. Разрешете достъп от настройките на браузъра.";
      } else if (error.code === 2) {
        statusEl.textContent =
          "Локацията не е налична. Проверете дали GPS или услугата за местоположение е включена.";
      } else if (error.code === 3) {
        statusEl.textContent =
          "Не успяхме да вземем локация навреме. Проверете дали локацията е включена и опитайте отново.";
      } else {
        statusEl.textContent =
          "Възникна непозната грешка при получаване на локацията.";
      }

      latitudeEl.textContent = "—";
      longitudeEl.textContent = "—";
      accuracyEl.textContent = "—";
      addressEl.textContent = "—";
      currentLat = null;
      currentLon = null;
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }
  );
}

function getAddress(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  fetch(url, {
    headers: {
      Accept: "application/json"
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.display_name) {
        addressEl.textContent = data.display_name;
      } else {
        addressEl.textContent = "Адресът не може да бъде определен.";
      }
    })
    .catch(() => {
      addressEl.textContent = "Грешка при получаване на адрес.";
    });
}

function openMyLocation() {
  if (currentLat !== null && currentLon !== null) {
    const url = `https://www.google.com/maps?q=${currentLat},${currentLon}`;
    window.open(url, "_blank");
  } else {
    statusEl.textContent = "Първо трябва да вземете локация.";
  }
}

function openNearbyRestaurants() {
  if (currentLat !== null && currentLon !== null) {
    const url = `https://www.google.com/maps/search/?api=1&query=restaurants+near+${currentLat},${currentLon}`;
    window.open(url, "_blank");
  } else {
    statusEl.textContent = "Първо трябва да вземете локация.";
  }
}