document.addEventListener('DOMContentLoaded', () => {
    
    /* --- 0. Preloader & Background Audio --- */
    const preloader = document.getElementById('preloader');
    const openBtn = document.getElementById('openInviteBtn');
    const bgMusic = document.getElementById('bgMusic');

    // Prevent scrolling while preloader is active
    document.body.style.overflow = 'hidden';

    const closePreloader = () => {
        if (preloader.classList.contains('hidden')) return;
        
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto'; // allow scrolling
        
        // Attempt to play background music
        if (bgMusic) {
            bgMusic.volume = 0.4;
            bgMusic.play().catch(error => {
                console.log('Audio autoplay was prevented by the browser:', error);
            });
        }

        // Start exploring animations only when the screen reveals
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    };

    if (preloader && openBtn) {
        openBtn.addEventListener('click', closePreloader);
        
        // Allow clicking anywhere on the preloader background to open it
        preloader.addEventListener('click', (e) => {
             if(e.target === preloader || e.target.classList.contains('preloader-content') || e.target.classList.contains('tap-text')) {
                 closePreloader();
             }
        });
    }

    /* --- Guest Personalization (URL ?guest=Name) --- */
    const urlParams = new URLSearchParams(window.location.search);
    let guestNameParam = urlParams.get('guest');
    
    if (guestNameParam && guestNameParam.trim() !== '') {
        guestNameParam = guestNameParam.trim();
        
        // Update the display name
        const guestNameDisplay = document.getElementById('dynamicGuestName');
        if (guestNameDisplay) {
            guestNameDisplay.textContent = guestNameParam;
        }
        
        // Auto-fill the RSVP form name field mapping
        const formNameInput = document.getElementById('name');
        if (formNameInput) {
            formNameInput.value = guestNameParam;
        }
    }

    /* --- Heart Rain Background Effect --- */
    const rainContainer = document.getElementById('heartRainContainer');
    if (rainContainer) {
        // Spawn a heart gently every 600ms
        setInterval(() => {
            const heart = document.createElement('i');
            heart.classList.add('fa-solid', 'fa-heart', 'falling-heart');
            
            const size = Math.random() * 1.5 + 0.5; // 0.5rem to 2.0rem
            const leftPos = Math.random() * 100; // Spawn across full width
            const duration = Math.random() * 6 + 9; // Slow fall: 9s to 15s
            const opacity = Math.random() * 0.5 + 0.1; // Opacity varies 0.1 - 0.6
            
            heart.style.fontSize = `${size}rem`;
            heart.style.left = `${leftPos}vw`;
            heart.style.animationDuration = `${duration}s`;
            heart.style.setProperty('--max-opacity', opacity);
            
            // Sprinkle in some soft white/golden hearts (theme matching) randomly
            const randColor = Math.random();
            if (randColor > 0.8) {
                heart.style.color = '#fff'; // White
            } else if (randColor > 0.6) {
                heart.style.color = '#faebd7'; // Soft gold/antique white
            }
            
            rainContainer.appendChild(heart);
            
            // Clean up to prevent DOM bloat
            setTimeout(() => {
                heart.remove();
            }, duration * 1000);
        }, 600);
    }
    
    /* --- 1. Scroll Animations --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    // Wait for preloader to close before attaching the observer
    if (!preloader) {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    }

    /* --- 2. Countdown Timer --- */
    // Set the date we're counting down to: August 14, 2026, 09:30:00 AM
    const countDownDate = new Date("Aug 14, 2026 09:30:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result securely
        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

        // If the count down is finished
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("clock").innerHTML = "<div class='time-box'><span class='number'>Today is the Day!</span></div>";
        }
    };

    // Update the count down every 1 second
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call

    /* --- 3. RSVP Form Submission --- */
    const rsvpForm = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span><i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                attendance: document.getElementById('attendance').value,
                message: document.getElementById('message').value
            };

            fetch('https://formspree.io/f/mnjlqzdk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.ok) {
                    return response.json().catch(() => ({})); 
                } else {
                    throw new Error("Formspree submission failed.");
                }
            })
            .then(data => {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                
                // Formspree implicitly means success if it reaches here and response.ok was true
                if (formData.attendance === 'yes') {
                    formMessage.innerText = "Thank you! We can't wait to see you there.";
                } else {
                    formMessage.innerText = "Thank you for letting us know. We'll miss you!";
                }
                formMessage.style.color = '#2e7d32';
                formMessage.style.backgroundColor = '#e8f5e9';
                rsvpForm.reset();
                
                formMessage.classList.remove('hidden');
                formMessage.style.display = 'block';

                setTimeout(() => {
                    formMessage.classList.add('hidden');
                    formMessage.style.display = 'none';
                }, 6000);
            })
            .catch(error => {
                console.error("Fetch error details:", error);
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                
                formMessage.innerText = "Failed to connect to the server.";
                formMessage.style.color = '#d32f2f';
                formMessage.style.backgroundColor = '#ffebee';
                
                formMessage.classList.remove('hidden');
                formMessage.style.display = 'block';

                setTimeout(() => {
                    formMessage.classList.add('hidden');
                    formMessage.style.display = 'none';
                }, 6000);
            });
        });
    }

});
