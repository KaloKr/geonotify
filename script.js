const locationBtn = document.getElementById("locationBtn");
const mapBtn = document.getElementById("mapBtn");

let currentLat = null;
let currentLon = null;

const latitudeEl = document.getElementById("latitude");
const longitudeEl = document.getElementById("longitude");
const accuracyEl = document.getElementById("accuracy");
const statusEl = document.getElementById("status");

locationBtn.addEventListener("click", getLocation);
mapBtn.addEventListener("click", openNearbyRestaurants);

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    statusEl.textContent = "Този браузър не поддържа известия.";
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      statusEl.textContent = "Известията са разрешени.";
      showNotification("GeoNotify", "Известията са активирани успешно.");
    } else if (permission === "denied") {
      statusEl.textContent = "Известията са отказани.";
    } else {
      statusEl.textContent = "Разрешението за известия не е дадено.";
    }
  });
}

function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
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

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      currentLat = latitude;
      currentLon = longitude;

      latitudeEl.textContent = latitude.toFixed(6);
      longitudeEl.textContent = longitude.toFixed(6);
      accuracyEl.textContent = `${accuracy.toFixed(2)} метра`;
      statusEl.textContent = "Локацията е засечена успешно.";

      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      showNotification(
        "GeoNotify",
        `Локацията е засечена: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      );
    },
    (error) => {
      if (error.code === 1) {
        statusEl.textContent = "Достъпът до локацията е отказан. Разрешете достъп от настройките на браузъра.";
      } else if (error.code === 2) {
        statusEl.textContent = "Локацията не е налична. Проверете дали GPS или услугата за местоположение е включена.";
      } else if (error.code === 3) {
        statusEl.textContent = "Не успяхме да вземем локация навреме. Проверете дали локацията е включена и опитайте отново.";
      } else {
        statusEl.textContent = "Възникна непозната грешка при получаване на локацията.";
      }

      latitudeEl.textContent = "—";
      longitudeEl.textContent = "—";
      accuracyEl.textContent = "—";
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

function openNearbyRestaurants() {
  if (currentLat !== null && currentLon !== null) {
    const url = `https://www.google.com/maps/search/?api=1&query=restaurants+near+${currentLat},${currentLon}`;
    window.open(url, "_blank");
  } else {
    statusEl.textContent = "Първо трябва да вземете локация.";
  }
}