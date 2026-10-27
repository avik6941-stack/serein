const revealItems = document.querySelectorAll(".scroll-reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const serviceSelect = document.querySelector("#service");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");
const summaryLabel = document.querySelector("#summary-label");
const summaryPrice = document.querySelector("#summary-price");
const bookingForm = document.querySelector("#booking-form");
const bookingMessage = document.querySelector("#booking-message");
const bookingSubmit = bookingForm.querySelector('button[type="submit"]');

const kolkataDateParts = Object.fromEntries(
  new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]),
);
bookingDate.min = `${kolkataDateParts.year}-${kolkataDateParts.month}-${kolkataDateParts.day}`;

const appointmentTimes = Array.from({ length: 15 }, (_, index) => {
  const startMinutes = 11 * 60 + index * 60;
  const hour = Math.floor(startMinutes / 60) % 24;
  const period = hour < 12 ? "am" : "pm";
  const displayHour = hour % 12 || 12;
  return { label: `${displayHour}:00 ${period}`, startMinutes };
});

function updateAvailableTimes() {
  const duration = Number(serviceSelect.selectedOptions[0].dataset.duration);
  const selectedTime = bookingTime.value;
  bookingTime.replaceChildren(new Option("Select a time", ""));

  appointmentTimes
    .filter(({ startMinutes }) => startMinutes + duration <= 25 * 60)
    .forEach(({ label }) => bookingTime.add(new Option(label, label)));

  if ([...bookingTime.options].some((option) => option.value === selectedTime)) {
    bookingTime.value = selectedTime;
  }
}

function updateSummary() {
  const selected = serviceSelect.selectedOptions[0];
  summaryLabel.textContent = `${selected.value} · ${selected.dataset.duration} minutes`;
  summaryPrice.textContent = `₹${Number(selected.dataset.price).toLocaleString("en-IN")}`;
  updateAvailableTimes();

  document.querySelectorAll(".treatment-card").forEach((card) => {
    const button = card.querySelector(".select-treatment");
    card.classList.toggle("is-selected", button?.dataset.service === selected.value);
  });
}

serviceSelect.addEventListener("change", updateSummary);
updateSummary();

document.querySelectorAll(".select-treatment").forEach((button) => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;
    updateSummary();
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    bookingDate.focus({ preventScroll: true });
  });
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  if (window.location.protocol === "file:") {
    bookingMessage.textContent = "Open the site through the appointment request server at http://localhost:3000 to send a request.";
    bookingMessage.classList.add("is-visible");
    return;
  }

  const formData = new FormData(bookingForm);
  const request = Object.fromEntries(formData.entries());
  bookingSubmit.disabled = true;
  bookingMessage.textContent = "Sending your appointment request…";
  bookingMessage.classList.add("is-visible");

  try {
    const response = await fetch("/api/appointment-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.error || `The appointment request could not be sent (HTTP ${response.status}).`);
    }

    bookingMessage.textContent = "Your appointment request has been received. The studio will contact you after reviewing it. This is not a confirmed appointment.";
    bookingForm.reset();
    updateSummary();
  } catch (error) {
    console.error("Unable to send appointment request.", error);
    bookingMessage.textContent = error instanceof TypeError
      ? "We couldn’t connect to the appointment request service. Please try again later or email rideravik47@gmail.com."
      : error.message;
  } finally {
    bookingSubmit.disabled = false;
  }
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("is-open", !isOpen);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("is-open");
  });
});
