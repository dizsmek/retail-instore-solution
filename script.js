const CITY_TO_IANA_NAME = {
  cupertino: 'America/Los_Angeles',
  'new-york-city': 'America/New_York',
  london: 'Europe/London',
  amsterdam: 'Europe/Brussels',
  tokyo: 'Asia/Tokyo',
  'hong-kong': 'Asia/Hong_Kong',
  sydney: 'Australia/Sydney'
};

/**
 * Fetches current time at city.
 * @param {string} cityName
 */
const getCurrentTimeAt = async(cityName) => {
  const [continent, city] = CITY_TO_IANA_NAME[cityName].split('/');
  const res = await fetch(`https://timeapi.io/api/time/current/zone?timeZone=${continent}%2F${city}`);

  // Errors are handled by the method calling `getCurrentTimeAt`, so we can just throw an error here.
  if (res.status !== 200) throw new Error('Failed to fetch time data from server');

  return await res.json();
}

/**
 * Keeps track of the interval to check if the time changed, so we can clear it.
 */
let timeCheckInterval;

/**
 * Updates displayed time and starts an interval to check when it changes.
 * @param {HTMLElement} activeNavItem 
 */
const updateDisplayedTime = async (activeNavItem) => {
  // Find active nav item if it wasn't provided.
  if (!activeNavItem) {
    activeNavItem = document.querySelector('.nav-list-item.active');
  }

  // Clear the existing interval.
  if (timeCheckInterval) clearInterval(timeCheckInterval);

  // Get the three time status showing elements. Statuses being:
  // - Time loading
  // - Time loaded and ready for display
  // - Time loading failed
  const loadingMessage = document.getElementById('loadingMessage');
  const currentTimeDisplay = document.getElementById('currentTime');
  const failedToLoadMessage = document.getElementById('failedToLoad');

  // Show only loading message initially.
  loadingMessage.classList.remove('hide');
  currentTimeDisplay.classList.add('hide');
  failedToLoadMessage.classList.add('hide');

  // Display which city we're fetching the time for.
  loadingMessage.querySelector('.cityNameDisplay').innerText = activeNavItem.innerText;

  try {
    // Fetch and update DOM to show current time in selected city.
    const currentTimeData = await getCurrentTimeAt(activeNavItem.dataset.city);
    currentTimeDisplay.querySelector('.cityNameDisplay').innerText = activeNavItem.innerText;
    currentTimeDisplay.querySelector('#timeDisplay').innerHTML = currentTimeData.time;

    let currentTime = currentTimeData.time;

    loadingMessage.classList.add('hide');
    currentTimeDisplay.classList.remove('hide');

    // Set an interval to check for time changes every second.
    timeCheckInterval = setInterval(async () => {
      const newTimeData = await getCurrentTimeAt(activeNavItem.dataset.city);
      if (currentTime !== newTimeData.time) updateDisplayedTime();
    }, 1000);
  } catch (error) {
    // If we got an error while fetching the time, we display the error message on the page.
    loadingMessage.classList.add('hide');
    failedToLoadMessage.classList.remove('hide');
    console.error(error.message);
  }
};

/**
 * Updates the position of the selected nav item indicator.
 * @param {HTMLElement} activeNavItem 
 * @param {Boolean} animate - If `true`, sets a CSS transition on the indicator moving.
 */
const updateIndicatorPosition = (activeNavItem, animate = false) => {
  const indicator = document.getElementById('navIndicator');

  // Find active nav item if it wasn't provided.
  if (!activeNavItem) {
    activeNavItem = document.querySelector('.nav-list-item.active');
  }
  
  // Handle potential animation by setting the CSS transition property.
  const TRANSITION_DURATION = 200;
  if (animate) {
    indicator.style.transition = `all ${TRANSITION_DURATION}ms`;
  }

  // Update position and width to match to the anchor tags inside the nav items
  indicator.style.left = `${activeNavItem.firstChild.offsetLeft}px`;
  indicator.style.width = `${activeNavItem.firstChild.offsetWidth}px`;

  // Remove CSS transition once it's finished.
  setTimeout(() => {
    indicator.style.transition = 'none';
  }, TRANSITION_DURATION);
}

/**
 * Updates indicator position and gets the time for the clicked navigation item.
 * @param {Event} event
 */
const handleNavItemClick = (event) => {
  const clickedNavItem = event.currentTarget;

  // Prevent handling the click of the currently active nav item.
  if (clickedNavItem.classList.contains('active')) return;

  // Clear interval checking for time changes for previously selected item.
  if (timeCheckInterval) clearInterval(timeCheckInterval);

  document.querySelector('.nav-list-item.active').classList.remove('active');
  clickedNavItem.classList.add('active');

  updateIndicatorPosition(clickedNavItem, true);
  updateDisplayedTime(clickedNavItem);
};

window.onresize = () => {
  // Update indicator position on window resize, without animation.
  updateIndicatorPosition();
}

window.onload = () => {
  updateIndicatorPosition();
  updateDisplayedTime();
}

