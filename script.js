const body = document.body;
const loader = document.getElementById("loader");
const topbar = document.getElementById("topbar");
const nav = document.getElementById("nav");
const menu = document.getElementById("menu");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const backTop = document.getElementById("backTop");
const toast = document.getElementById("toast");

/* LOADER */
window.addEventListener("load", () => {
    setTimeout(() => {
        loader.classList.add("hide");
        body.classList.remove("no-scroll");
    }, 1600);
});

/* MOBILE MENU */
menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
        menu.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
    });
});

/* DARK / LIGHT MODE */
const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "dark") {
    body.dataset.theme = "dark";
    themeIcon.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
    const dark = body.dataset.theme === "dark";

    if (dark) {
        delete body.dataset.theme;
        localStorage.setItem("portfolio-theme", "light");
        themeIcon.textContent = "☾";
        showToast("Light mode enabled");
    } else {
        body.dataset.theme = "dark";
        localStorage.setItem("portfolio-theme", "dark");
        themeIcon.textContent = "☀";
        showToast("Dark mode enabled");
    }
});

/* SCROLL EFFECTS */
window.addEventListener("scroll", () => {
    topbar.classList.toggle("scrolled", window.scrollY > 30);
    backTop.classList.toggle("show", window.scrollY > 600);
    updateActiveNav();
});

backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* REVEAL ANIMATIONS */
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => {
    revealObserver.observe(element);
});

/* ACTIVE NAV */
const sections = [...document.querySelectorAll("main section[id]")];

function updateActiveNav() {
    const scrollPosition = window.scrollY + window.innerHeight * 0.35;
    let current = "home";

    sections.forEach(section => {
        if (scrollPosition >= section.offsetTop) {
            current = section.id;
        }
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${current}`
        );
    });
}

updateActiveNav();

/* ANIMATED COUNTERS */
const counters = document.querySelectorAll("[data-count]");

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const decimal = counter.dataset.decimal === "true";
        const duration = 1100;
        const start = performance.now();

        function animate(time) {
            const progress = Math.min((time - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;

            counter.textContent = decimal
                ? value.toFixed(2)
                : Math.floor(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
        observer.unobserve(counter);
    });
}, { threshold: 0.7 });

counters.forEach(counter => counterObserver.observe(counter));

/* PROJECT FILTER */
const filters = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");

filters.forEach(filter => {
    filter.addEventListener("click", () => {
        filters.forEach(item => item.classList.remove("active"));
        filter.classList.add("active");

        const selected = filter.dataset.filter;

        projectCards.forEach(card => {
            const categories = card.dataset.category.split(" ");
            const visible = selected === "all" || categories.includes(selected);
            card.classList.toggle("hidden", !visible);

            if (visible) {
                card.classList.remove("visible");
                requestAnimationFrame(() => card.classList.add("visible"));
            }
        });
    });
});

/* CONTACT FORM VALIDATION */
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

const fields = {
    name: {
        input: document.getElementById("name"),
        error: document.getElementById("nameError"),
        message: "Please enter your name."
    },
    email: {
        input: document.getElementById("email"),
        error: document.getElementById("emailError"),
        message: "Please enter a valid email."
    },
    subject: {
        input: document.getElementById("subject"),
        error: document.getElementById("subjectError"),
        message: "Please enter a subject."
    },
    message: {
        input: document.getElementById("message"),
        error: document.getElementById("messageError"),
        message: "Please write a message."
    }
};

function validateField(key) {
    const field = fields[key];
    const value = field.input.value.trim();
    let valid = value.length > 0;

    if (key === "email") {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    field.input.parentElement.classList.toggle("invalid", !valid);
    field.error.textContent = valid ? "" : field.message;

    return valid;
}

Object.keys(fields).forEach(key => {
    fields[key].input.addEventListener("blur", () => validateField(key));
    fields[key].input.addEventListener("input", () => {
        if (fields[key].input.parentElement.classList.contains("invalid")) {
            validateField(key);
        }
    });
});

form.addEventListener("submit", event => {
    event.preventDefault();

    const valid = Object.keys(fields)
        .map(validateField)
        .every(Boolean);

    if (!valid) {
        formStatus.textContent = "Please correct the highlighted fields.";
        formStatus.style.color = "#e28d8d";
        return;
    }

    const name = fields.name.input.value.trim();
    const email = fields.email.input.value.trim();
    const subject = fields.subject.input.value.trim();
    const message = fields.message.input.value.trim();

    const mailSubject = encodeURIComponent(subject);
    const mailBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
    );

    window.location.href =
        `mailto:poojasivabaghya1525@gmail.com?subject=${mailSubject}&body=${mailBody}`;

    formStatus.textContent = "Opening your email application...";
    formStatus.style.color = "#8bc49a";
    showToast("Message prepared successfully");
});

/* TOAST */
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* CUSTOM CURSOR */
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (window.matchMedia("(pointer: fine)").matches) {
    body.classList.add("cursor-ready");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    window.addEventListener("mousemove", event => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function moveRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;

        requestAnimationFrame(moveRing);
    }

    moveRing();

    document.querySelectorAll("a, button, .project-card, .skill-card").forEach(element => {
        element.addEventListener("mouseenter", () => {
            cursorRing.style.width = "48px";
            cursorRing.style.height = "48px";
        });

        element.addEventListener("mouseleave", () => {
            cursorRing.style.width = "32px";
            cursorRing.style.height = "32px";
        });
    });
}

/* HERO PHOTO PARALLAX */
const photo = document.querySelector(".photo-frame");

window.addEventListener("mousemove", event => {
    if (window.innerWidth < 760 || !photo) return;

    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;

    photo.style.transform = `translate(${x}px, ${y}px)`;
});

/* KEYBOARD ACCESSIBILITY */
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        nav.classList.remove("open");
        menu.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
    }
});
