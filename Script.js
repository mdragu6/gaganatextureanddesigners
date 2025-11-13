// --- Constants for Hero Carousel ---
const carousel = document.getElementById("heroCarousel");
const slides = carousel ? carousel.querySelectorAll(".slide") : [];
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
const dotsContainer = document.querySelector(".dots"); 

let current = 0;
let dots = []; // Initialize dots array
const AUTO_SLIDE_INTERVAL = 5000; // Slide changes every 5 seconds

let slideTimer; // Variable to hold the automatic slide interval


// --- NEW: Typing Effect Logic for Headline ---
function typeHeadlineText() {
    const headlineSpan = document.querySelector(".headline-text-wrapper");
    if (!headlineSpan) return;

    const fullText = headlineSpan.dataset.text;
    headlineSpan.textContent = "";

    let i = 0;
    const typingSpeed = 70; // milliseconds per letter

    function type() {
        if (i < fullText.length) {
            headlineSpan.textContent += fullText.charAt(i);
            i++;
            setTimeout(type, typingSpeed);
        }
    }

    type();
}


// --- Existing Typing Effect Logic for Domain ---
function typeDomainText() {
    const domainSpan = document.querySelector(".domain-text-wrapper");
    if (!domainSpan) return;

    const fullText = domainSpan.dataset.text;
    domainSpan.textContent = "";

    let i = 0;
    const typingSpeed = 70;

    function type() {
        if (i < fullText.length) {
            domainSpan.textContent += fullText.charAt(i);
            i++;
            setTimeout(type, typingSpeed);
        }
    }

    type();
}


// --- Fireworks and Helper Functions (Unchanged) ---
function launchFireworks() {
    const fireworksContainer = document.getElementById("fireworks");
    if (!fireworksContainer) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: hsl(${Math.random() * 360}, 90%, 70%);
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: fireworkPop 0.8s ease-out infinite alternate ${Math.random() * 2}s;
            opacity: 0;
        `;
        fireworksContainer.appendChild(particle);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fireworkPop {
            0% { transform: scale(0.1); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(0.5); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function autoAdvanceSlider() { showSlide(current + 1); }
function startSliderTimer() { clearInterval(slideTimer); slideTimer = setInterval(autoAdvanceSlider, AUTO_SLIDE_INTERVAL); }
function stopSliderTimer() { clearInterval(slideTimer); }


// --- Fullscreen Welcome & Initial Load Logic (Revised Timing) ---
window.addEventListener("load", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const shown = sessionStorage.getItem("welcomeShown");
  
  // Total hold time for the welcome screen (8000ms = 8 seconds)
  const totalVisibleDuration = 8000; 

  if (!welcomeScreen) return;

  if (!shown) {
    sessionStorage.setItem("welcomeShown", "true");
    
    // 1. Show the screen and launch fireworks
    requestAnimationFrame(() => {
      welcomeScreen.classList.add("show");
      launchFireworks();
    });

    // 2. Start the HEADLINE typing animation immediately
    setTimeout(() => {
        typeHeadlineText();
    }, 1000); // 1.0s delay after screen appears

    // 3. Start the DOMAIN typing animation after the headline finishes (approx. 20 letters * 70ms = 1400ms)
    setTimeout(() => {
        typeDomainText(); 
    }, 3000); // 3.0s delay to allow headline to finish and logo to drop

    // 4. Hide the screen after the extended hold time
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      welcomeScreen.classList.remove("show");
    }, totalVisibleDuration + 1200); 

    // 5. Start the carousel AND its automatic cycling 
    setTimeout(() => {
      const nextBtn = document.querySelector(".carousel-btn.next");
      if (nextBtn) nextBtn.click();
      
      startSliderTimer(); 
    }, totalVisibleDuration + 1300); 

  } else {
    // Skip intro if already shown
    welcomeScreen.style.display = "none";
    startSliderTimer(); 
  }
});


// --- Hero Carousel Core Logic (Unchanged, as it works) ---
function generateDots() {
    if (!dotsContainer || !slides.length) return;
    dotsContainer.innerHTML = '';

    slides.forEach((slide, idx) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener("click", () => {
            showSlide(idx);
            startSliderTimer(); 
        });
        dotsContainer.appendChild(dot);
    });

    dots = dotsContainer.querySelectorAll("button");
}

generateDots();

function showSlide(index) {
  if (!slides.length) return;
  
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  
  current = index; 
  
  slides.forEach((s, idx) => {
      if (idx === current) {
          s.classList.add("active");
          s.style.zIndex = 2;
      } else {
          s.classList.remove("active");
          s.style.zIndex = 1;
      }
  });

  if (dots.length) {
      dots.forEach(d => d.classList.remove("active"));
      dots[current].classList.add("active");
  }
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
        showSlide(current - 1);
        startSliderTimer();
    });
    nextBtn.addEventListener("click", () => {
        showSlide(current + 1);
        startSliderTimer();
    });
}

showSlide(current);

if (carousel) {
    carousel.addEventListener('mouseenter', stopSliderTimer);
    carousel.addEventListener('mouseleave', startSliderTimer);
}