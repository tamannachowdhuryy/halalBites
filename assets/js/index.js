document.addEventListener("DOMContentLoaded", () => {
  // --- Global Variables ---
  let restaurants = []; // Shared global variable for restaurants data

  // --- Load Restaurant Data ---
  function loadRestaurantsData(csvFilePath, callback) {
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvData) => {
        const parsedData = Papa.parse(csvData, { header: true });
        restaurants = parsedData.data.map((restaurant) => ({
          name: restaurant.Name || "Unknown",
          borough: restaurant.Boroughs?.toLowerCase().replace(/\s+/g, "-") || "unknown",
          cuisine: restaurant.Cuisine || "Unknown",
          address: restaurant.Address || "Unknown",
          phoneNumber: restaurant["Phone Number"] || "N/A",
          website: restaurant.Website || "N/A",
          rating: parseFloat(restaurant.Rating) || 0,
          reviews: parseInt(restaurant.Reviews, 10) || 0,
          price: parseInt(restaurant.Price, 10) || 0,
          features: restaurant.Features?.split(",").map((f) => f.trim()) || [],
          lat: parseFloat(restaurant.Lat) || null,
          lng: parseFloat(restaurant.Lng) || null,
        }));
        console.log("Loaded Restaurants:", restaurants); // Debugging log
        if (callback) callback();
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }

  // --- Filter Restaurants ---
  function filterRestaurants(categoryQuery, locationQuery) {
    const lowerCategoryQuery = categoryQuery.toLowerCase();
    const lowerLocationQuery = locationQuery.toLowerCase();

    return restaurants.filter(
      (restaurant) =>
        (!lowerCategoryQuery || restaurant.name.toLowerCase().includes(lowerCategoryQuery)) &&
        (!lowerLocationQuery || restaurant.address.toLowerCase().includes(lowerLocationQuery))
    );
  }

  // --- Redirect to Borough ---
  function redirectToBorough(filteredRestaurants) {
    if (filteredRestaurants.length === 0) {
      alert("No matching restaurants found.");
      return;
    }

    const borough = filteredRestaurants[0].borough;
    const restaurantName = filteredRestaurants[0].name;
    const lat = filteredRestaurants[0].lat;
    const lng = filteredRestaurants[0].lng;

    if (borough && borough !== "unknown") {
      const boroughPage = `${borough}.html?name=${encodeURIComponent(restaurantName)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
      console.log("Redirecting to:", boroughPage);
      window.location.href = boroughPage;
    } else {
      alert("Borough information is missing or invalid.");
    }
  }

  // --- Initialize Search Feature ---
  function initSearchFeature() {
    const searchButton = document.getElementById("search-button");
    const categoryInput = document.getElementById("category-search");
    const locationInput = document.getElementById("location-search");

    if (!searchButton || !categoryInput || !locationInput) {
      console.error("Search elements are missing from the DOM");
      return;
    }

    searchButton.addEventListener("click", () => {
      console.log("Search button clicked!"); // Debugging log
      const categoryQuery = categoryInput.value.trim();
      const locationQuery = locationInput.value.trim();

      if (!categoryQuery && !locationQuery) {
        alert("Please enter a category or location!");
        return;
      }

      const filteredRestaurants = filterRestaurants(categoryQuery, locationQuery);
      console.log("Filtered Results:", filteredRestaurants); // Debugging log
      redirectToBorough(filteredRestaurants);
    });
  }

  // --- Highlight Card on Load ---
  function highlightFirstCardAndPin() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantName = urlParams.get("name");
    const lat = parseFloat(urlParams.get("lat"));
    const lng = parseFloat(urlParams.get("lng"));

    if (!restaurantName || isNaN(lat) || isNaN(lng)) {
      console.log("No valid search parameters provided.");
      return;
    }

    console.log("Search params:", { restaurantName, lat, lng });

    const cards = Array.from(document.querySelectorAll(".restaurant-card"));
    let matchingCard = null;

    cards.forEach((card) => {
      const cardTitle = card.querySelector("h2")?.textContent || "";
      if (cardTitle.toLowerCase().includes(restaurantName.toLowerCase())) {
        matchingCard = card;
      }
    });

    if (matchingCard) {
      console.log("Found matching card:", matchingCard);

      cards.forEach((card) => (card.style.display = "none"));
      matchingCard.style.display = "block";
      matchingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      matchingCard.classList.add("highlight");

      setTimeout(() => {
        matchingCard.classList.remove("highlight");
      }, 3000);

      if (map) {
        map.setView([lat, lng], 15);
        const marker = L.marker([lat, lng])
          .bindPopup(`<b>${restaurantName}</b>`)
          .addTo(map);
        marker.openPopup();
      }
    } else {
      console.warn("No matching card found for:", restaurantName);
      alert(`No restaurant found matching "${restaurantName}".`);
    }
  }

  // --- Initialize All Features ---
  loadRestaurantsData("Data/enriched_restaurants.csv", () => {
    initSearchFeature();
    setTimeout(highlightFirstCardAndPin, 500);
  });
});
