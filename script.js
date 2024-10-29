const indicator = document.getElementById('navIndicator');

const updateIndicatorPosition = (activeNavItem, animate = false) => {
  const activeAnchorElement = activeNavItem ? activeNavItem.firstChild : document.querySelector('.nav-list-item.active').firstChild;
  
  const TRANSITION_DURATION = 200;
  if (animate) {
    indicator.style.transition = `all ${TRANSITION_DURATION}ms`;
  }

  indicator.style.left = `${activeAnchorElement.offsetLeft}px`;
  indicator.style.width = `${activeAnchorElement.offsetWidth}px`;

  setTimeout(() => {
    indicator.style.transition = 'none';
  }, TRANSITION_DURATION);
}

const handleNavItemClick = (event) => {
  const clickedNavItem = event.currentTarget;

  if (clickedNavItem.classList.contains('active')) return;

  document.querySelector('.nav-list-item.active').classList.remove('active');
  clickedNavItem.classList.add('active');

  updateIndicatorPosition(clickedNavItem, true);
}

window.onresize = () => {
  updateIndicatorPosition();
}

// Initialize indicator position on page load
updateIndicatorPosition();
