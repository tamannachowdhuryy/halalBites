document.addEventListener("DOMContentLoaded", () => {
  let restaurants = []; // Shared global variable for restaurants data

  // Mapping borough names to HTML filenames
  const boroughMap = {
    "staten island": "staten-island",
    "new york": "manhattan",
    "brooklyn": "brooklyn",
    "queens": "queens",
    "bronx": "bronx",
  };

  // --- Load Restaurant Data ---
  function loadRestaurantsData(csvFilePath, callback) {
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvData) => {
        const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });
        restaurants = parsedData.data.map((restaurant) => ({
          name: restaurant.Name || "Unknown",
          borough: restaurant.Boroughs?.trim().toLowerCase() || "unknown",
          cuisine: restaurant.Cuisine || "Unknown",
          address: restaurant.Address || "Unknown",
          lat: parseFloat(restaurant.Lat) || null,
          lng: parseFloat(restaurant.Lng) || null,
        }));
        if (callback) callback();
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }

  // --- Filter Restaurants ---
  function filterRestaurants(nameQuery, locationQuery) {
    const lowerNameQuery = nameQuery.toLowerCase();
    const lowerLocationQuery = locationQuery.toLowerCase();

    return restaurants.filter((restaurant) => {
      const nameMatch = restaurant.name.toLowerCase().includes(lowerNameQuery);
      const boroughMatch = restaurant.borough.toLowerCase().includes(lowerLocationQuery);
      return (!lowerNameQuery || nameMatch) && (!lowerLocationQuery || boroughMatch);
    });
  }

  // --- Redirect to Borough Page ---
  function redirectToBorough(filteredRestaurants) {
    if (filteredRestaurants.length === 0) {
      alert("No matching restaurants found.");
      return;
    }

    const restaurant = filteredRestaurants[0];
    const borough = boroughMap[restaurant.borough] || restaurant.borough;

    if (borough === "unknown") {
      alert("Borough not recognized.");
      return;
    }

    const params = new URLSearchParams();
    params.set("name", restaurant.name);
    if (restaurant.lat && restaurant.lng) {
      params.set("lat", restaurant.lat);
      params.set("lng", restaurant.lng);
    }

    // Redirect to borough page
    window.location.href = `${borough}.html?${params.toString()}`;
  }

  // --- Highlight and Pin Restaurant ---
  function highlightAndPinRestaurant() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantName = urlParams.get("name");
    const lat = parseFloat(urlParams.get("lat"));
    const lng = parseFloat(urlParams.get("lng"));

    if (!restaurantName) {
      console.warn("No restaurant name provided in query parameters.");
      return;
    }

    const cards = Array.from(document.querySelectorAll(".restaurant-card"));
    let matchingCard = null;

    cards.forEach((card) => {
      const cardTitle = card.querySelector("h2")?.textContent.toLowerCase();
      if (cardTitle && cardTitle.includes(restaurantName.toLowerCase())) {
        matchingCard = card;
      } else {
        card.style.display = "none"; // Hide non-matching cards
      }
    });

    if (matchingCard) {
      console.log("Found matching card:", matchingCard);

      matchingCard.style.display = "block"; // Show only the matching card
      matchingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      matchingCard.classList.add("highlight");

      setTimeout(() => {
        matchingCard.classList.remove("highlight");
      }, 3000);

      if (!isNaN(lat) && !isNaN(lng) && typeof map !== "undefined") {
        map.setView([lat, lng], 15);
        const marker = L.marker([lat, lng])
          .bindPopup(`<b>${restaurantName}</b>`)
          .addTo(map);
        marker.openPopup();
      } else {
        console.warn("Map or coordinates not available.");
      }
    } else {
      console.warn("No matching card found for:", restaurantName);
      alert(`No restaurant card found for "${restaurantName}".`);
    }
  }

  // --- Initialize Search Feature ---
  function initSearchFeature() {
    const searchButton = document.getElementById("search-button");
    const categoryInput = document.getElementById("category-search");
    const locationInput = document.getElementById("location-search");

    if (!searchButton || !categoryInput || !locationInput) {
      console.error("Search elements are missing.");
      return;
    }

    searchButton.addEventListener("click", () => {
      const categoryQuery = categoryInput.value.trim();
      const locationQuery = locationInput.value.trim();

      if (!categoryQuery && !locationQuery) {
        alert("Please enter a search term!");
        return;
      }

      const filteredRestaurants = filterRestaurants(categoryQuery, locationQuery);
      redirectToBorough(filteredRestaurants);
    });
  }

  // --- Initialize Application ---
  loadRestaurantsData("Data/neb.csv", () => {
    initSearchFeature();
    highlightAndPinRestaurant();
  });
});
