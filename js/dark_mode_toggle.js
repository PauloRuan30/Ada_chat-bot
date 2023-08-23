const switchToggle = document.querySelector('#switch-toggle');
const switchBackground = document.querySelector('#switch-bg');
const rootHTMLNode = document.querySelector(".body");
let isDarkmode = localStorage.getItem('isDarkmode') === 'true';

const dModeString = "color-scheme: dark"
const lModeString = "color-scheme: light"

const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
</svg>`;

const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>`;

function toggleTheme() {
    isDarkmode = !isDarkmode;
    localStorage.setItem('isDarkmode', isDarkmode);
    switchTheme();
  }
  
function switchTheme() {
  if (isDarkmode) {
    document.body.classList.add('dark'); // Add the dark mode class to the body
    switchToggle.classList.remove('bg-yellow-500', '-translate-x-2');
    switchBackground.classList.remove('bg-white');
    switchToggle.classList.add('bg-gray-700', 'translate-x-full');
    switchBackground.classList.add('bg-gray-500');
    setTimeout(() => {
      switchToggle.innerHTML = darkIcon;
    }, 250);
    rootHTMLNode.style = dModeString
  } else {
    document.body.classList.remove('dark'); // Remove the dark mode class from the body
    switchToggle.classList.add('bg-yellow-500', '-translate-x-2');
    switchBackground.classList.add('bg-white');
    switchToggle.classList.remove('bg-gray-700', 'translate-x-full');
    switchBackground.classList.remove('bg-gray-500');
    setTimeout(() => {
      switchToggle.innerHTML = lightIcon;
    }, 250);
    rootHTMLNode.style = lModeString
  }
}

switchTheme();

