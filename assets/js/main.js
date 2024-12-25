/**
* Template Name: Yummy
* Template URL: https://bootstrapmade.com/yummy-bootstrap-restaurant-website-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

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

const restaurants = [
  {
    name: "Kabab King",
    cuisine: "Pakistani",
    address: "73-01 37th Ave, Jackson Heights",
    rating: 4.7,
    reviews: 3700,
    price: 2, // $$
    category: ["pakistani"],
    features: ["delivery", "takeout", "good-for-dinner"],
    lat: 40.7489,
    lng: -73.8927,
  },
  {
    name: "Shah's Halal",
    cuisine: "Middle Eastern",
    address: "68-19 Main St, Flushing",
    rating: 4.5,
    reviews: 2500,
    price: 1, // $
    category: ["middle-eastern"],
    features: ["outdoor-seating", "good-for-lunch"],
    lat: 40.7469,
    lng: -73.8247,
  },
];

// Initialize map
const map = L.map("map").setView([40.7489, -73.8927], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const markers = {};

function addMarkers() {
  restaurants.forEach((r) => {
    const marker = L.marker([r.lat, r.lng])
      .bindPopup(`<b>${r.name}</b><br>${r.cuisine}<br>${r.address}`)
      .addTo(map);
    markers[r.name] = marker;
  });
}

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
  container.innerHTML = "";

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

  filteredRestaurants.forEach((r) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${r.name}</h2>
      <p>${r.cuisine}</p>
      <p>${r.address}</p>
      <div class="rating-container">
        ${renderStars(r.rating)} <span>${r.rating} (${formatReviews(r.reviews)} reviews)</span>
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

// Example function to filter restaurants (modify as needed)
function filterRestaurantsByCategory(categories) {
  console.log('Filtering restaurants by categories:', categories);
  // Add logic here to filter and display the restaurants
}


