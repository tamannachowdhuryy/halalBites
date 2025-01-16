let restaurants = []; // Global variable for restaurants data

// Load restaurant data from CSV
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
          lat: parseFloat(restaurant.Lat) || null, // Ensure valid float or null
          lng: parseFloat(restaurant.Lng) || null, // Ensure valid float or null
        }));
        if (callback) callback();
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }
  

// Filter restaurants by category and location
function filterRestaurants(restaurants, categoryQuery, locationQuery) {
  const lowerCategoryQuery = categoryQuery.toLowerCase();
  const lowerLocationQuery = locationQuery.toLowerCase();

  return restaurants.filter(
    (restaurant) =>
      (!lowerCategoryQuery || restaurant.name.toLowerCase().includes(lowerCategoryQuery)) &&
      (!lowerLocationQuery || restaurant.address.toLowerCase().includes(lowerLocationQuery))
  );
}

// Redirect to the borough's HTML page
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
      console.log("Redirecting to:", boroughPage); // Debugging
      window.location.href = boroughPage;
    } else {
      alert("Borough information is missing or invalid.");
    }
  }
  
  
  

// Initialize search functionality
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const categoryInput = document.getElementById("category-search");
  const locationInput = document.getElementById("location-search");

  // Load restaurant data and set up search functionality
  loadRestaurantsData("Data/enriched_restaurants.csv", () => {
    searchButton.addEventListener("click", () => {
      const categoryQuery = categoryInput.value.trim();
      const locationQuery = locationInput.value.trim();

      if (!categoryQuery && !locationQuery) {
        alert("Please enter a category or location!");
        return;
      }

      const filteredRestaurants = filterRestaurants(
        restaurants, // Use global restaurants array
        categoryQuery,
        locationQuery
      );

      redirectToBorough(filteredRestaurants); // Redirect based on the filtered results
    });
  });
});

let mapInstance = null; // Global variable for the map instance

function highlightFirstCardAndPin() {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantName = urlParams.get("name");
  const lat = parseFloat(urlParams.get("lat"));
  const lng = parseFloat(urlParams.get("lng"));

  // Check if all required parameters are provided
  if (!restaurantName || isNaN(lat) || isNaN(lng)) {
    console.log("No valid search parameters provided. Skipping highlight and map actions.");
    return; // Exit the function early if no valid search parameters
  }

  console.log("Search params:", { restaurantName, lat, lng });

  const cards = Array.from(document.querySelectorAll(".restaurant-card"));
  let matchingCard = null;

  // Find the matching card
  cards.forEach((card) => {
    const cardTitle = card.querySelector("h2")?.textContent || "";
    if (cardTitle.toLowerCase().includes(restaurantName.toLowerCase())) {
      matchingCard = card;
    }
  });

  if (matchingCard) {
    console.log("Found matching card:", matchingCard);

    // Highlight and scroll to the matching card
    cards.forEach((card) => (card.style.display = "none")); // Hide all cards
    matchingCard.style.display = "block"; // Show only the matching card
    matchingCard.scrollIntoView({ behavior: "smooth", block: "center" });
    matchingCard.classList.add("highlight");
    matchingCard.style.transition = "background-color 0.3s ease";
    matchingCard.style.backgroundColor = "#ffeb3b";

    setTimeout(() => {
      matchingCard.style.backgroundColor = "";
      matchingCard.classList.remove("highlight");
    }, 3000);

    // Add the pin and show popup
    if (map) {
      // Center the map on the restaurant
      map.setView([lat, lng], 15);

      // Add a marker if it doesn't exist or update it
      const marker = L.marker([lat, lng])
        .bindPopup(
          `<b>${restaurantName}</b><br>Address: ${
            matchingCard.querySelector("p:nth-child(3)")?.textContent ||
            "Address not available"
          }`
        )
        .addTo(map);

      // Open the popup
      marker.openPopup();
    } else {
      console.error("Map instance is invalid.");
    }
  } else {
    console.warn("No matching card found for:", restaurantName);
    alert(`No restaurant found matching "${restaurantName}".`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  setTimeout(() => {
      console.log("Running highlight function after delay");
      highlightFirstCardAndPin();
  }, 500); // Add small delay to ensure dynamic content is loaded
});