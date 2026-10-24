const serviceSelect = document.querySelector("#service");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");
const summaryLabel = document.querySelector("#summary-label");
const summaryPrice = document.querySelector("#summary-price");
const bookingForm = document.querySelector("#booking-form");
const bookingMessage = document.querySelector("#booking-message");
const bookingSubmit = bookingForm.querySelector('button[type="submit"]');

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
  .toISOString()
  .slice(0, 10);
bookingDate.min = localToday;

const appointmentTimes = [
  ...Array.from({ length: 15 }, (_, index) => {
    const startMinutes = 11 * 60 + index * 60;
    const hour = Math.floor(startMinutes / 60) % 24;
    const period = hour < 12 ? "am" : "pm";
    const displayHour = hour % 12 || 12;
    return { label: `${displayHour}:00 ${period}`, startMinutes };
  }),
];

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
}

serviceSelect.addEventListener("change", updateSummary);
updateAvailableTimes();

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

  const formData = new FormData(bookingForm);
  const selectedService = serviceSelect.selectedOptions[0];
  const booking = {
    name: formData.get("name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    location: formData.get("location"),
    service: formData.get("service"),
    date: formData.get("date"),
    time: formData.get("time"),
  };

  bookingSubmit.disabled = true;
  bookingMessage.textContent = "Sending your booking request…";
  bookingMessage.classList.add("is-visible");

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });
    const responseText = await response.text();
    let result = null;

    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        throw new Error(`The booking service returned an invalid response (HTTP ${response.status}). Make sure the Node.js booking server is running.`);
      }
    } else if (response.ok) {
      throw new Error("The booking service returned an empty response. Make sure the Node.js booking server is running.");
    }

    if (!response.ok) {
      throw new Error(result?.error || `The booking request could not be saved (HTTP ${response.status}).`);
    }

    bookingMessage.textContent = "Your booking request has been saved. The studio will review it and contact you if it is approved; this is not a confirmed appointment.";
    bookingForm.reset();
    updateSummary();
  } catch (error) {
    console.error("Unable to save booking request.", error);
    bookingMessage.textContent = error instanceof TypeError
      ? "We couldn’t connect to the booking service. Please try again later or email rideravik47@gmail.com."
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
