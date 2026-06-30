/* ==========================================================
   TEEJEI ♥ JUDITH WEDDING MICROSITE
========================================================== */

const GOOGLE_FORM_URL = "";

/* ==========================================================
   AOS
========================================================== */

AOS.init({
    duration: 1200,
    once: true,
    offset: 100
});

/* ==========================================================
   LOADER
========================================================== */

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    // 🔥 PRELOAD RSVP DATA HERE (NEW)
    preloadRSVP().catch(console.error);

    setTimeout(() => {
        loader.classList.add("stage-open");
    }, 1200);

    setTimeout(() => {
        loader.classList.add("stage-hold");
    }, 2600);

    setTimeout(() => {
        loader.style.transition = "opacity 1.2s ease";
        loader.style.opacity = "0";
    }, 3800);

    setTimeout(() => {
        loader.style.display = "none";
    }, 5200);
});
/* ==========================================================
   COUNTDOWN
========================================================== */

const weddingDate = new Date("December 20, 2026 14:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const d = document.getElementById("days");
    const h = document.getElementById("hours");
    const m = document.getElementById("minutes");
    const s = document.getElementById("seconds");

    if (d) d.textContent = days;
    if (h) h.textContent = hours;
    if (m) m.textContent = minutes;
    if (s) s.textContent = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ==========================================================
   SMOOTH NAVIGATION
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

/* ==========================================================
    SECTIONS & SCROLL TO TOP
========================================================== */

const sections = [
    ...document.querySelectorAll(
        '.hero, .section, .venue-section, .thankyou-section'
    )
];

let currentSection = 0;
const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    // Show/hide scroll to top button
    if (window.scrollY > 500) {
        scrollBtn?.classList.add("show");
    } else {
        scrollBtn?.classList.remove("show");
    }

    // Track current section for potential future use
    let closest = 0;
    let smallestDistance = Infinity;

    sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top);
        if (distance < smallestDistance) {
            smallestDistance = distance;
            closest = index;
        }
    });

    currentSection = closest;
}, { passive: true });

if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ==========================================================
   MUSIC PLAYER
========================================================== */

const musicBtn = document.getElementById("musicToggle");
const music = document.getElementById("bgMusic");
let isPlaying = false;

if (musicBtn && music) {
    musicBtn.addEventListener("click", () => {
        if (!isPlaying) {
            // Explicitly tell Chrome to load the file on click interaction
            music.load();

            // Handle Chrome's autoplay promise
            music.play()
                .then(() => {
                    musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    isPlaying = true;
                })
                .catch((error) => {
                    console.log("Chrome blocked playback or file not found:", error);
                    alert("Please interact with the page first or check if audio/enchanted.mp3 exists!");
                });
        } else {
            music.pause();
            musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
            isPlaying = false;
        }
    });
}

/* ==========================================================
   MOBILE MENU
========================================================== */

const mobileBtn = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
    });
}

/* ==========================================================
   LIGHTBOX
========================================================== */

const galleryImages = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.querySelector(".lightbox-close");

galleryImages.forEach(img => {
    img.addEventListener("click", () => {
        if (!lightbox || !lightboxImage) return;
        lightbox.classList.add("active");
        lightboxImage.src = img.src;
    });
});

if (closeLightbox) {
    closeLightbox.addEventListener("click", () => {
        lightbox.classList.remove("active");
    });
}

if (lightbox) {
    lightbox.addEventListener("click", e => {
        if (e.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });
}

/* ==========================================================
   RSVP MODAL
========================================================== */

const openRSVP = document.getElementById("openRSVPBtn");
const rsvpModal = document.getElementById("rsvpModal");
const closeModal = document.querySelector(".close-modal");

// if (openRSVP && rsvpModal) {
//     openRSVP.addEventListener("click", () => {
//         rsvpModal.classList.add("active");
//         loadRSVPData();
//     });
// }

if (closeModal) {
    closeModal.addEventListener("click", () => {
        rsvpModal.classList.remove("active");
    });
}

window.addEventListener("click", e => {
    if (e.target === rsvpModal) {
        rsvpModal.classList.remove("active");
    }
});


/* ==========================================================
   RSVP SYSTEM (WITH CONTACT NUMBER)
========================================================== */

// const API_URL = "https://script.google.com/macros/s/AKfycbw4JkYWQs-63WEIf5-NkD2yP5SWiEfcYMu-QN5k3dP4ikYmZJB1nloOLm1GrdWDqFb8pA/exec";
const API_URL = "https://script.google.com/macros/s/AKfycbxxluMviyYVyFa-CqIGRyvEPeNrKkES7RTgcasDwriEsP-TCeHhgf7RXdON3rZbQ8DQNQ/exec";

const token = new URLSearchParams(window.location.search).get("token");
console.log("TOKEN:", token);

const modal = document.getElementById("rsvpModal");
const form = document.getElementById("rsvpForm");
const openBtn = document.getElementById("openRSVPBtn");

/* OPEN MODAL */
if (openBtn && modal) {
    openBtn.addEventListener("click", async () => {
        modal.classList.add("active");

        // 🧠 wait until cache is ready OR load it
        if (!cachedGuest) {
            await preloadRSVP();
        }

        loadRSVPData();
    });
}

/* LOAD DATA */
async function loadRSVPData() {
    if (!cachedGuest) return;

    const guest = cachedGuest;

    document.getElementById("rsvpGroupName").textContent = guest.group_name;
    document.getElementById("contactNumber").value = guest.contact || "";

    // 🔥 safety fallback
    if (!Array.isArray(cachedSeats)) {
        cachedSeats = [];
    }

    await loadSeats(guest.max_pax);
}

/* LOAD SEATS */
async function loadSeats(maxPax) {

    const seats = cachedSeats || [];

    const container = document.getElementById("guestSeatsContainer");
    container.innerHTML = "";

    // 🔥 Normalize backend values (VERY IMPORTANT FIX)
    const normalize = (v) => (v || "").toString().trim().toLowerCase();

    // 🔥 Convert array to map (FAST LOOKUP O(1))
    const seatMap = {};
    seats.forEach(s => {
        seatMap[Number(s.seat_no)] = {
            name: s.name || "",
            attending: normalize(s.attending)
        };
    });

    let html = "";

    for (let i = 1; i <= maxPax; i++) {

        const seat = seatMap[i] || { name: "", attending: "pending" };

        html += `
            <div class="seat-group">

                <label>Guest ${i}</label>

                <input type="text"
                    class="guest-name"
                    placeholder="Guest ${i} name"
                    value="${seat.name}"
                />

                <select class="attending">

                    <option value="pending" ${seat.attending === "pending" ? "selected" : ""}>
                        Not yet decided
                    </option>

                    <option value="attending" ${seat.attending === "attending" ? "selected" : ""}>
                        Attending
                    </option>

                    <option value="not_attending" ${seat.attending === "not_attending" ? "selected" : ""}>
                        Not attending
                    </option>

                </select>

            </div>
        `;
    }

    container.innerHTML = html;
}

/* SUBMIT RSVP */
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";
        }

        try {
            const contact = document.getElementById("contactNumber").value.trim();

            const names = document.querySelectorAll(".guest-name");
            const checks = document.querySelectorAll(".attending");

            const seats = Array.from(names).map((input, i) => ({
                seat_no: i + 1,
                name: input.value.trim(),
                attending: checks[i]?.value
            }));

            console.log("API_URL =", API_URL);

            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    token,
                    contact,
                    seats
                })
            });

            let result;

            try {
                result = await res.json();
            } catch (err) {
                throw new Error("Invalid server response");
            }

            if (result.status === "success") {

                showToast("RSVP saved successfully!");

                // close modal
                modal.classList.remove("active");

                // optional: refresh cache so next open is updated
                if (typeof preloadRSVP === "function") {
                    preloadRSVP();
                }

            } else {
                throw new Error(result.message || "Save failed");
            }

        } catch (error) {
            console.error(error);
            showToast("Failed to save RSVP. Please try again.", "error");

        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Save RSVP";
            }
        }
    });
}

/* CLOSE MODAL */
if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });
}

/* ==========================================================
   CONFETTI
========================================================== */

function launchConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;

    for (let i = 0; i < 120; i++) {
        const confetti = document.createElement("span");
        confetti.className = "confetti-piece";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.top = "-20px";
        confetti.style.position = "fixed";
        confetti.style.width = "10px";
        confetti.style.height = "10px";

        // Colors updated from [Gold, Blush, White] to match CSS: [Gold, Sage Green, White]
        confetti.style.background = ["#D4AF37", "#A3B899", "#FFFFFF"][Math.floor(Math.random() * 3)];
        confetti.style.borderRadius = "50%";
        confetti.style.zIndex = "9999";
        confetti.style.transition = "transform 4s linear";

        container.appendChild(confetti);

        requestAnimationFrame(() => {
            confetti.style.transform = `translateY(${window.innerHeight + 200}px) rotate(${Math.random() * 720}deg)`;
        });

        setTimeout(() => {
            confetti.remove();
        }, 4500);
    }
}

/* ==========================================================
   FLOATING SAGE LEAVES + ROSE PETALS
========================================================== */

const canvas = document.getElementById("petalCanvas");

if (canvas) {

    const ctx = canvas.getContext("2d");
    let petals = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class FloatingElement {

        constructor() {

            this.type =
                Math.random() < 0.7
                    ? "leaf"
                    : "rose";

            this.reset();
        }

        reset() {

            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height;

            if (this.type === "leaf") {

                this.width =
                    8 + Math.random() * 8;

                this.length =
                    this.width * 2.8;

            } else {

                this.width =
                    6 + Math.random() * 6;

                this.length =
                    this.width * 2.1;
            }

            this.speed =
                0.8 + Math.random() * 1.4;

            this.swing =
                0.5 + Math.random() * 1.5;

            this.angle =
                Math.random() * Math.PI;

            this.rotationSpeed =
                (Math.random() - 0.5) * 0.015;
        }

        update() {

            this.y += this.speed;

            this.x +=
                Math.sin(this.y * 0.015)
                * this.swing;

            this.angle +=
                this.rotationSpeed;

            if (
                this.y >
                canvas.height + 50
            ) {
                this.reset();
            }
        }

        drawLeaf() {

            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    this.length
                );

            gradient.addColorStop(
                0,
                "rgba(110,127,101,0.9)"
            );

            gradient.addColorStop(
                0.5,
                "rgba(163,184,153,0.85)"
            );

            gradient.addColorStop(
                1,
                "rgba(220,235,220,0.7)"
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            ctx.moveTo(0, 0);

            ctx.quadraticCurveTo(
                this.width,
                this.length * 0.4,
                0,
                this.length
            );

            ctx.quadraticCurveTo(
                -this.width,
                this.length * 0.4,
                0,
                0
            );

            ctx.fill();
        }

        drawRose() {

            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    this.length
                );

            gradient.addColorStop(
                0,
                "rgba(214,82,120,0.95)"
            );

            gradient.addColorStop(
                0.5,
                "rgba(240,120,150,0.85)"
            );

            gradient.addColorStop(
                1,
                "rgba(255,190,210,0.7)"
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            ctx.moveTo(0, 0);

            ctx.bezierCurveTo(
                this.width,
                -this.width,
                this.width * 1.5,
                this.length * 0.5,
                0,
                this.length
            );

            ctx.bezierCurveTo(
                -this.width * 1.5,
                this.length * 0.5,
                -this.width,
                -this.width,
                0,
                0
            );

            ctx.fill();
        }

        draw() {

            ctx.save();

            ctx.translate(
                this.x,
                this.y
            );

            ctx.rotate(
                this.angle
            );

            if (
                this.type === "leaf"
            ) {

                this.drawLeaf();

            } else {

                this.drawRose();
            }

            ctx.restore();
        }
    }

    const particleCount =
        window.innerWidth < 768
            ? 20
            : 40;

    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        petals.push(
            new FloatingElement()
        );
    }

    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        petals.forEach(
            petal => {

                petal.update();
                petal.draw();

            }
        );

        requestAnimationFrame(
            animate
        );
    }

    animate();
}
/* ==========================================================
    GALLERY SWIPE SUPPORT
========================================================== */

let touchStartY = 0;
let touchEndY = 0;

if (lightbox) {
    lightbox.addEventListener("touchstart", e => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener("touchend", e => {
        touchEndY = e.changedTouches[0].screenY;
        // Close lightbox on downward swipe
        if (touchEndY - touchStartY > 50) {
            lightbox.classList.remove("active");
        }
    }, { passive: true });
}

/* ==========================================================
   HERO REVEAL
========================================================== */

document.querySelectorAll(".hero-content *").forEach((el, index) => {
    el.style.opacity = 0;

    setTimeout(() => {
        el.style.transition = "all 1s ease";
        el.style.opacity = 1;
        el.style.transform = "translateY(0)";
    }, 400 * index);
});

// QR FULLSCREEN MODAL
document.addEventListener("DOMContentLoaded", () => {

    const qrBox = document.getElementById("qrBox");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxClose = document.querySelector(".lightbox-close");

    if (qrBox && lightbox && lightboxImage) {
        qrBox.addEventListener("click", () => {
            const img = qrBox.querySelector("img");

            lightboxImage.src = img.src;
            lightbox.classList.add("active");
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener("click", () => {
            lightbox.classList.remove("active");
        });
    }

    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
            }
        });
    }

});


let cachedGuest = null;
let cachedSeats = null;

async function preloadRSVP() {
    if (!token) {
        console.error("Missing token in URL");
        return;
    }

    const url1 = `${API_URL}?action=guest&token=${encodeURIComponent(token)}`;
    const guestRes = await fetch(url1);
    cachedGuest = await guestRes.json();

    if (!cachedGuest || !cachedGuest.token) {
        cachedGuest = null;
        cachedSeats = [];
        return;
    }

    const url2 = `${API_URL}?action=seats&token=${encodeURIComponent(token)}`;
    const seatsRes = await fetch(url2);
    cachedSeats = await seatsRes.json() || [];
}


function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.remove("success", "error", "show");
    toast.classList.add(type, "show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
// const qrImg = document.querySelector("#qrBox img");

// if (qrImg) {
//     qrImg.addEventListener("click", () => {
//         qrModal.classList.add("active");
//     });
// }

/* ==========================================================
    END
========================================================== */
const attireSlides = document.querySelectorAll(".attire-slide");
const sliderDots = document.querySelectorAll(".slider-dot");

let currentSlide = 0;
let autoSlide;

function showSlide(index) {

    attireSlides.forEach(slide =>
        slide.classList.remove("active")
    );

    sliderDots.forEach(dot =>
        dot.classList.remove("active")
    );

    attireSlides[index].classList.add("active");
    sliderDots[index].classList.add("active");

    currentSlide = index;
}

function nextSlide() {

    currentSlide++;

    if (currentSlide >= attireSlides.length) {
        currentSlide = 0;
    }

    showSlide(currentSlide);

}

function startSlider() {

    autoSlide = setInterval(nextSlide, 5000);

}

function restartSlider() {

    clearInterval(autoSlide);

    startSlider();

}

sliderDots.forEach(dot => {

    dot.addEventListener("click", function () {

        showSlide(Number(this.dataset.slide));

        restartSlider();

    });

});

showSlide(0);

startSlider();