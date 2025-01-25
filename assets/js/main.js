

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  
  
  

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();




// Global variables
const map = L.map("map").setView([40.7489, -73.8927], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
const markers = {}; // Store markers globally
let restaurants = []; // Declare restaurants globally
let currentPage = 1; // Current page
const itemsPerPage = 4; // Number of items per page

function loadRestaurantsData(csvFilePath) {
  fetch(csvFilePath)
    .then((response) => response.text())
    .then((csvData) => {
      const parsedData = Papa.parse(csvData, { header: true });
      restaurants = parsedData.data.map((restaurant) => ({
        name: restaurant.Name || "Unknown",
        borough: restaurant.Boroughs?.trim().toLowerCase() || "unknown", // Normalize borough
        cuisine: restaurant.Cuisine || "Unknown",
        address: restaurant.Address || "Unknown",
        phoneNumber: restaurant["Phone Number"] || "N/A",
        website: restaurant.Website || null,
        rating: parseFloat(restaurant.Rating) || 0,
        reviews: parseInt(restaurant.Reviews, 10) || 0,
        price: parseInt(restaurant.Price, 10) || 0,
        category: (restaurant.Category || "").split(",").map((c) => c.trim()),
        features: (restaurant.Features || "").split(",").map((f) => f.trim()),
        lat: parseFloat(restaurant.Lat) || null,
        lng: parseFloat(restaurant.Lng) || null,
        link: restaurant.Link || null,
      }));
      // Determine the current borough from the page filename
      const currentBorough = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "")
        .replace("-", " ") // Replace hyphens with spaces
        .toLowerCase();

      const filteredRestaurants = restaurants.filter(
        (r) => r.borough.trim().toLowerCase() === currentBorough
      );


      // Display the first page of filtered restaurants
      displayRestaurants(1, filteredRestaurants);

      // Add markers to the map for the filtered restaurants
      addMarkers(filteredRestaurants);
    })
    .catch((error) => console.error("Error loading CSV:", error));
}


function displayRestaurants(page, restaurantsToShow) {
  // Validate input
  if (!Array.isArray(restaurantsToShow)) {
    console.error("restaurantsToShow is not an array:", restaurantsToShow);
    return;
  }

  const container = document.getElementById("restaurants");

  // Ensure container exists
  if (!container) {
    console.error("Element with id 'restaurants' not found in DOM.");
    return;
  }

  container.innerHTML = ""; // Clear existing content

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Slice restaurants for current page
  const currentRestaurants = restaurantsToShow.slice(startIndex, endIndex);

  if (currentRestaurants.length === 0) {
    container.innerHTML = "<p>No restaurants found for this page.</p>";
    return;
  }

  // Generate restaurant cards
  currentRestaurants.forEach((restaurant) => {
    const card = document.createElement("div");
    card.classList.add("restaurant-card");
    card.innerHTML = `
      <div class="card-content">
        <h2>${restaurant.name || "Unknown"}</h2>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine || "Unknown"}</p>
        <p><strong>Address:</strong> ${restaurant.address || "Unknown"}</p>
        <p><strong>Phone:</strong> ${restaurant.phoneNumber || "N/A"}</p>
        <p><strong>Rating:</strong> ${restaurant.rating || 0} ⭐</p>
        <p><strong>Reviews:</strong> ${restaurant.reviews || 0}</p>
        ${
          restaurant.website
            ? `<p><strong>Website:</strong> <a href="${restaurant.website}" target="_blank">${restaurant.website}</a></p>`
            : "<p><strong>Website:</strong> N/A</p>"
        }
        <p><strong>Price:</strong> ${"$".repeat(restaurant.price || 0)}</p>
        <p><strong>Features:</strong> ${
          restaurant.features?.join(", ") || "None"
        }</p>
        ${
          restaurant.link
            ? `<p><strong>Location Link:</strong> <a href="${restaurant.link}" target="_blank">View on Map</a></p>`
            : "<p><strong>Location Link:</strong> N/A</p>"
        }
      </div>
    `;

    // Add click event to focus on marker
    card.addEventListener("click", () => {
      if (markers[restaurant.name]) {
        map.setView([restaurant.lat, restaurant.lng], 15);
        markers[restaurant.name].openPopup();
      } else {
        console.warn(`No marker found for ${restaurant.name}`);
      }
    });

    container.appendChild(card);
  });

  // Update pagination controls
  updatePaginationControls(restaurantsToShow);
}


function addMarkers(restaurants) {
  if (!Array.isArray(restaurants)) {
    console.error("Invalid restaurants array:", restaurants);
    return;
  }

  restaurants.forEach((r) => {
    if (r.lat && r.lng) {
      const marker = L.marker([r.lat, r.lng])
        .bindPopup(`<b>${r.name}</b><br>${r.cuisine}<br>${r.address}`)
        .addTo(map);
      markers[r.name] = marker; // Store marker by name
    } else {
      console.warn(`Invalid lat/lng for restaurant: ${r.name}`);
    }
  });
}

function updatePaginationControls(restaurantsToShow) {
  const paginationContainer = document.getElementById("pagination-controls");
  paginationContainer.innerHTML = ""; // Clear existing controls

  const totalPages = Math.ceil(restaurantsToShow.length / itemsPerPage);
  const visiblePages = 5; // Number of page buttons to show
  
  // Create Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.className = "pagination-btn prev";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayRestaurants(currentPage, restaurantsToShow);
    }
  });
  paginationContainer.appendChild(prevButton);

  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages, startPage + visiblePages - 1);

  // Adjust start if we're near the end
  if (endPage - startPage + 1 < visiblePages) {
    startPage = Math.max(1, endPage - visiblePages + 1);
  }

  // Add first page if needed
  if (startPage > 1) {
    addPageButton(1);
    if (startPage > 2) {
      addEllipsis();
    }
  }

  // Add visible page buttons
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(i);
  }

  // Add last page if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      addEllipsis();
    }
    addPageButton(totalPages);
  }

  // Create Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.className = "pagination-btn next";
  nextButton.disabled = currentPage >= totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayRestaurants(currentPage, restaurantsToShow);
    }
  });
  paginationContainer.appendChild(nextButton);

  // Helper function to add page button
  function addPageButton(pageNum) {
    const pageButton = document.createElement("button");
    pageButton.textContent = pageNum;
    pageButton.className = "pagination-btn page";
    if (pageNum === currentPage) {
      pageButton.classList.add("active-page");
    }
    pageButton.addEventListener("click", () => {
      currentPage = pageNum;
      displayRestaurants(currentPage, restaurantsToShow);
    });
    paginationContainer.appendChild(pageButton);
  }

  // Helper function to add ellipsis
  function addEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    ellipsis.className = "pagination-ellipsis";
    paginationContainer.appendChild(ellipsis);
  }
}

// Call the function with your CSV file path
loadRestaurantsData("Data/neb.csv");



function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return `
    ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
    ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ""}
    ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
  `;
}

function formatReviews(reviews) {
  if (reviews >= 1000) {
    return (reviews / 1000).toFixed(1) + "k";
  }
  return reviews;
}

function applyFilters() {
  const selectedFilters = {
    price: filters.price.map((el, i) => (el.checked ? i + 1 : null)).filter((val) => val !== null),
    category: filters.category.map((el) => (el.checked ? el.id : null)).filter((val) => val !== null),
    features: filters.features.map((el) => (el.checked ? el.id : null)).filter((val) => val !== null),
  };

  renderRestaurants(document.getElementById("search").value, selectedFilters);
}


function renderRestaurants(filter = "", selectedFilters = {}) {
  const container = document.getElementById("restaurants");
  container.innerHTML = ""; // Clear existing content

  let filteredRestaurants = restaurants;

  // Apply text search filter
  if (filter) {
    filteredRestaurants = filteredRestaurants.filter((r) =>
      r.name.toLowerCase().includes(filter.toLowerCase())
    );
  }

  // Apply price filters
  if (selectedFilters.price?.length) {
    filteredRestaurants = filteredRestaurants.filter((r) => selectedFilters.price.includes(r.price));
  }

  // Apply category filters
  if (selectedFilters.category?.length) {
    filteredRestaurants = filteredRestaurants.filter((r) =>
      selectedFilters.category.some((cat) => r.category.includes(cat))
    );
  }

  // Apply features filters
  if (selectedFilters.features?.length) {
    filteredRestaurants = filteredRestaurants.filter((r) =>
      selectedFilters.features.every((feature) => r.features.includes(feature))
    );
  }

  // Render filtered cards
  filteredRestaurants.forEach((r) => {
    const card = document.createElement("div");
    card.classList.add("restaurant-card"); // Ensure consistent class
    card.innerHTML = `
      <div class="card-content">
        <h2>${r.name}</h2>
        <p><strong>Cuisine:</strong> ${r.cuisine}</p>
        <p><strong>Address:</strong> ${r.address}</p>
        <p><strong>Phone:</strong> ${r.phoneNumber || "N/A"}</p>
        <p><strong>Rating:</strong> ${r.rating} ⭐</p>
        <p><strong>Reviews:</strong> ${r.reviews}</p>
        ${r.website ? `<p><strong>Website:</strong> <a href="${r.website}" target="_blank">${r.website}</a></p>` : "<p><strong>Website:</strong> N/A</p>"}
        <p><strong>Price:</strong> ${"$".repeat(r.price)}</p>
        <p><strong>Features:</strong> ${r.features.join(", ")}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      map.setView([r.lat, r.lng], 15);
      markers[r.name].openPopup();
    });

    container.appendChild(card);
  });
}


// Get all filter elements
const filters = {
  price: [
    document.getElementById("price-1"),
    document.getElementById("price-2"),
    document.getElementById("price-3"),
    document.getElementById("price-4"),
  ],
  category: [
    
    document.getElementById("pakistani"),
    document.getElementById("arabic"),
    document.getElementById("afghan"),
    document.getElementById("persian"),
    document.getElementById("bangladeshi"),
  ],
  features: [
    document.getElementById("delivery"),
    document.getElementById("takeout"),
    document.getElementById("outdoor-seating"),
    document.getElementById("good-for-dinner"),
  ],
};

// Add event listeners
Object.keys(filters).forEach((filterType) => {
  filters[filterType].forEach((filter) => {
    if (filter) {
      filter.addEventListener("change", applyFilters);
    }
  });
});

document.getElementById("search").addEventListener("input", (e) => {
  applyFilters();
});

// Initialize app
addMarkers();
applyFilters();


// Modal functionality
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("categoryModal");
  const seeAllBtn = document.getElementById("seeAllCategories");
  const closeButton = modal.querySelector(".close-button");

  // Show modal when "See all" is clicked
  seeAllBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  // Hide modal when the close button is clicked
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Hide modal when clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});



// Get references to the modal and buttons
const categoryModal = document.getElementById('categoryModal');
const seeAllCategoriesButton = document.getElementById('seeAllCategories');
const closeButton = document.querySelector('.close-button');
const searchButton = document.getElementById('categorySearchButton');

// Open the modal when "See All" is clicked
seeAllCategoriesButton.addEventListener('click', (e) => {
  e.preventDefault();
  categoryModal.style.display = 'block';
});

// Close the modal when the close button is clicked
closeButton.addEventListener('click', () => {
  categoryModal.style.display = 'none';
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (e) => {
  if (e.target === categoryModal) {
    categoryModal.style.display = 'none';
  }
});

// Handle the "Search" button click
searchButton.addEventListener('click', () => {
  // Get all checked checkboxes inside the modal
  const selectedCategories = Array.from(categoryModal.querySelectorAll('input[type="checkbox"]:checked'))
    .map((checkbox) => checkbox.parentElement.textContent.trim());

  // Log selected categories (or use them for filtering)
  console.log('Selected Categories:', selectedCategories);

  // Close the modal after the search
  categoryModal.style.display = 'none';

  // Optional: Call a function to filter restaurants based on the selected categories
  filterRestaurantsByCategory(selectedCategories);
});

function filterRestaurants(filterCriteria) {
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Apply your filter logic here
    return restaurant.cuisine.includes(filterCriteria);
  });

  displayRestaurants(filteredRestaurants);
}

const container = document.getElementById("restaurants");
container.innerHTML = ""; // Clear previous content




document.addEventListener("DOMContentLoaded", () => {
  // --- Chat Feature ---
  const ChatFeature = (() => {
    const chatButton = document.getElementById("chat-button");
    const chatBox = document.getElementById("chat-box");
    const closeChat = document.getElementById("close-chat");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    if (!chatButton || !chatBox || !closeChat || !chatForm || !chatInput || !chatMessages) {
      console.error("Chat elements are missing from the DOM");
      return;
    }

    let surveyState = {
      mood: null,
      craving: null,
      suggestedFoods: null,
      neighborhood: null,
      price: null,
    };
    let currentStep = 0;

    const initialQuestions = [
      "Hi! How are you feeling today?",
      "What kind of food are you craving right now? (e.g., comfort food, chicken, desserts)",
      "Which borough or neighborhood are you in? (e.g., Queens, Jackson Heights)",
      "What’s your price range? (Enter a number from 1 to 4, where 1 is inexpensive and 4 is luxury)",
    ];

    const addMessage = (message, sender) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("chat-message", sender);
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const askNextQuestion = () => {
      if (currentStep < initialQuestions.length) {
        addMessage(initialQuestions[currentStep], "bot");
      } else {
        sendSurveyData();
      }
    };

    const suggestFoodsBasedOnMood = (mood) => {
      const moodToFood = {
        sad: ["ice cream", "chocolate", "pizza", "fried chicken"],
        stressed: ["coffee", "tea", "soup"],
        happy: ["desserts", "cakes", "smoothies"],
        angry: ["spicy food", "burgers"],
        bored: ["snacks", "popcorn", "chips"],
      };
      surveyState.suggestedFoods = moodToFood[mood] || ["comfort food"];
      const options = surveyState.suggestedFoods.join(", ");
      addMessage(`Would you like something like ${options}?`, "bot");
    };

    const storeAnswer = (answer) => {
      switch (currentStep) {
        case 0:
          surveyState.mood = answer.toLowerCase();
          suggestFoodsBasedOnMood(surveyState.mood);
          currentStep++;
          return;
        case 1:
          surveyState.craving = answer.toLowerCase();
          break;
        case 2:
          surveyState.neighborhood = answer.toLowerCase();
          break;
        case 3:
          surveyState.price = parseInt(answer, 10);
          break;
      }
      currentStep++;
      askNextQuestion();
    };

    const sendSurveyData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(surveyState),
        });

        if (response.ok) {
          const responseData = await response.json();
          if (responseData.response && responseData.response.length > 0) {
            responseData.response.forEach((rec) => addMessage(rec, "bot"));
          } else {
            addMessage(responseData.message || "No recommendations found.", "bot");
          }
        } else {
          addMessage("Error fetching recommendations. Try again later.", "bot");
        }
      } catch (error) {
        console.error("Error:", error);
        addMessage("Unable to connect to the recommendation service.", "bot");
      }
    };

    chatButton.addEventListener("click", () => {
      chatBox.classList.remove("hidden");
      chatButton.style.display = "none";
      currentStep = 0;
      askNextQuestion();
    });

    closeChat.addEventListener("click", () => {
      chatBox.classList.add("hidden");
      chatButton.style.display = "block";
    });

    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      addMessage(userMessage, "user");
      chatInput.value = "";

      if (userMessage.toLowerCase() === "exit") {
        addMessage("Thanks for chatting! Have a great day!", "bot");
        currentStep = -1;
        return;
      }

      if (currentStep === 0) {
        storeAnswer(userMessage);
      } else if (currentStep > 0 && currentStep < initialQuestions.length) {
        storeAnswer(userMessage);
      } else {
        askNextQuestion();
      }
    });
  })();


  })();

// Request Location Access
function requestLocationAccess() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Center map and add marker
        map.setView([userLocation.lat, userLocation.lng], 13);
        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '📍',
            iconSize: [25, 25],
          }),
        }).addTo(map);

        // Enable distance filters
        document.querySelectorAll('input[name="distance"]').forEach((input) => {
          input.disabled = false;
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to access your location. Distance-based filtering will be disabled.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Calculate Distance (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  requestLocationAccess();
});




