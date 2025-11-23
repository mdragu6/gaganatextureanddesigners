document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DYNAMIC COPYRIGHT YEAR ---
    // This handles the year for ALL pages (footer id can be current-year or current-year-footer)
    const yearSpan = document.getElementById('current-year') || document.getElementById('current-year-footer');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 2. SCROLL ANIMATIONS (The "Reveal" Effect) ---
    // Includes elements from all pages: index, designs, materials, about, contact
    const reveals = document.querySelectorAll('.service-card, .design-card, .material-card, .about-hero-text, .usp-text, .contact-info-panel, .contact-form-panel, .team-member, .material-spec, .location-card');
    
    // Add 'reveal' class initially
    reveals.forEach(el => el.classList.add('reveal'));

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; 

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load


    // --- 3. VIDEO WELCOME SCREEN LOGIC ---
    const videoScreen = document.getElementById('welcomeVideoScreen');
    const video = document.getElementById('welcomeVideo');
    
    if (videoScreen && video) {
        const shown = sessionStorage.getItem("welcomeShown");
        if (shown) {
            videoScreen.style.display = 'none';
        } else {
            document.body.style.overflow = 'hidden'; // Prevent scrolling during video
            
            // Wait for video end
            video.onended = () => {
                videoScreen.style.opacity = '0';
                setTimeout(() => {
                    videoScreen.style.display = 'none';
                    document.body.style.overflow = ''; // Re-enable scrolling
                    sessionStorage.setItem("welcomeShown", "true");
                }, 500); // Match CSS fade-out time
            };
            
            // Fallback for immediate entry
            setTimeout(() => {
                if (videoScreen.style.display !== 'none') {
                    video.onended(); // Trigger fade out if user is impatient
                }
            }, 5000); // 5 seconds grace period
        }
    }


    // --- 4. CAROUSEL LOGIC ---
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        let current = 0;
        const slides = carousel.querySelectorAll('.slide');
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        const dotsContainer = carousel.querySelector('.dots');

        // Create dots
        if (dotsContainer) {
            slides.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.addEventListener("click", () => showSlide(idx));
                dotsContainer.appendChild(dot);
            });
        }
        
        const dots = dotsContainer ? dotsContainer.querySelectorAll("button") : [];

        function showSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            slides.forEach(s => s.classList.remove("active"));
            dots.forEach(d => d.classList.remove("active"));
            
            slides[index].classList.add("active");
            if (dots[index]) dots[index].classList.add("active");
            current = index;
        }

        // Init
        showSlide(0);

        // Controls
        if (prevBtn) prevBtn.addEventListener("click", () => showSlide(current - 1));
        if (nextBtn) nextBtn.addEventListener("click", () => showSlide(current + 1));

        // Auto Slide
        setInterval(() => showSlide(current + 1), 5000);
    }

    // --- 5. MOBILE MENU LOGIC ---
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // Toggle body overflow to prevent background scrolling
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when a link is clicked (for better mobile UX)
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 6. CONTACT FORM HANDLING (AJAX) ---
    const contactForm = document.getElementById('contactForm');
    const formResult = document.getElementById('formResult');
    const submitBtn = document.getElementById('formSubmitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent the default page reload

            // 1. Visual Feedback (Loading State)
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            formResult.style.display = 'none';
            formResult.className = 'form-result'; // Reset classes

            // 2. Prepare Data
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // 3. Send Data to API (Web3Forms)
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    // SUCCESS
                    formResult.innerHTML = "<i class='fas fa-check-circle'></i> Thank you! Your message has been sent.";
                    formResult.classList.add('success');
                    contactForm.reset(); // Clear the form
                } else {
                    // API ERROR
                    console.error("Form Submission Error:", response);
                    formResult.innerHTML = json.message || "An unexpected error occurred.";
                    formResult.classList.add('error');
                }
            })
            .catch(error => {
                // NETWORK ERROR
                console.error("Network Error:", error);
                formResult.innerHTML = "A network error occurred. Please check your connection and try again.";
                formResult.classList.add('error');
            })
            .finally(() => {
                // 4. Reset Button
                formResult.style.display = 'block';
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    if(formResult.classList.contains('success')) {
                        formResult.style.display = 'none';
                    }
                }, 5000);
            });
        });
    }

    // --- 7. DESIGNS PAGE: LOAD MORE LOGIC (Handles all 30 designs) ---
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    // Selects only the designs that are initially hidden
    const hiddenDesigns = document.querySelectorAll('.design-card.hidden-design'); 

    if (loadMoreBtn && hiddenDesigns.length > 0) {
        
        // Designs to show in each batch after the initial 12
        const designsPerLoad = 6; 
        let currentDesignsShown = 0;

        const showNextDesigns = () => {
            const start = currentDesignsShown;
            const end = start + designsPerLoad;

            // Loop through the hidden designs and add the 'revealed' class
            for (let i = start; i < end && i < hiddenDesigns.length; i++) {
                // The 'revealed' class in styles.css will make the design visible
                hiddenDesigns[i].classList.add('revealed'); 
            }

            currentDesignsShown += designsPerLoad;

            // Check if all remaining hidden designs have been revealed
            if (currentDesignsShown >= hiddenDesigns.length) {
                // Hide the button and update text when all 30 designs are visible
                loadMoreBtn.innerText = "All Designs Loaded";
                loadMoreBtn.disabled = true;
                loadMoreBtn.style.opacity = 0.5;
            }
        };
        
        loadMoreBtn.addEventListener('click', showNextDesigns);
    }
});
