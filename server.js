const path = require("node:path");
require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { MongoClient } = require("mongodb");

const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "serein";
const ownerEmail = "rideravik47@gmail.com";
const notifyEmail = process.env.NOTIFY_EMAIL || ownerEmail;
const resendApiKey = process.env.RESEND_API_KEY;
const mailFrom = process.env.MAIL_FROM || "Serein Bookings <onboarding@resend.dev>";
const treatments = {
  Unwind: { duration: 60, price: 1000 },
  Restore: { duration: 75, price: 1250 },
  Reconnect: { duration: 90, price: 1500 },
};
const locations = new Set(["Medinipur", "Kharagpur"]);
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many booking requests. Please try again later." },
});

if (!mongoUri) {
  console.error("MONGODB_URI is required. Set it in your environment before starting the server.");
  process.exit(1);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "connect-src": ["'self'"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "https://images.unsplash.com"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "https://fonts.googleapis.com"],
    },
  },
}));

app.get("/", (_request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.get("/styles.css", (_request, response) => {
  response.sendFile(path.join(__dirname, "styles.css"));
});

app.get("/script.js", (_request, response) => {
  response.sendFile(path.join(__dirname, "script.js"));
});

function getAppointmentTimes(duration) {
  return Array.from({ length: 15 }, (_, index) => {
    const startMinutes = 11 * 60 + index * 60;
    const hour = Math.floor(startMinutes / 60) % 24;
    const period = hour < 12 ? "am" : "pm";
    const displayHour = hour % 12 || 12;
    return {
      label: `${displayHour}:00 ${period}`,
      startMinutes,
    };
  })
    .filter(({ startMinutes }) => startMinutes + duration <= 25 * 60)
    .map(({ label }) => label);
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function kolkataDateString(date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

// Sends an owner notification through Resend's HTTP API (Render's free tier blocks SMTP).
// Never throws: a failed email must not fail the customer's booking.
async function notifyOwner(booking, bookingId) {
  if (!resendApiKey) return;
  const rows = [
    ["Name", booking.name],
    ["Email", booking.email],
    ["Mobile", booking.mobile],
    ["Location", booking.location],
    ["Treatment", `${booking.service} (${booking.duration} min, ₹${booking.price})`],
    ["Date", booking.date],
    ["Time", booking.time],
    ["Booking ID", bookingId],
  ];
  const html = `<h2>New Serein booking request</h2><table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table><p>Status: pending. Contact the customer to confirm.</p>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: mailFrom,
        to: [notifyEmail],
        reply_to: booking.email,
        subject: `New booking: ${booking.service} on ${booking.date} at ${booking.time}`,
        html,
      }),
    });
    if (!res.ok) console.error("Booking email failed.", res.status, await res.text());
  } catch (error) {
    console.error("Booking email failed.", error);
  }
}

app.post(
  "/api/bookings",
  bookingLimiter,
  express.json({ limit: "10kb" }),
  async (request, response) => {
    const name = cleanText(request.body?.name);
    const email = cleanText(request.body?.email).toLowerCase();
    const mobile = cleanText(request.body?.mobile);
    const location = cleanText(request.body?.location);
    const service = cleanText(request.body?.service);
    const date = cleanText(request.body?.date);
    const time = cleanText(request.body?.time);
    const treatment = treatments[service];

    if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response.status(400).json({ error: "Enter a valid name and email address." });
    }
    if (mobile.length > 30 || !/^[+\d().\-\s]{7,30}$/.test(mobile) || mobile.replace(/\D/g, "").length < 7) {
      return response.status(400).json({ error: "Enter a valid mobile number." });
    }
    if (!locations.has(location) || !treatment) {
      return response.status(400).json({ error: "Choose a valid location and treatment." });
    }
    if (!isValidDate(date) || date < kolkataDateString(new Date())) {
      return response.status(400).json({ error: "Choose a valid future date." });
    }
    const requestedDate = new Date(`${date}T00:00:00.000Z`);
    if (requestedDate.getUTCDay() === 0) {
      return response.status(400).json({ error: "The studio is closed on Sundays. Choose another date." });
    }
    if (!getAppointmentTimes(treatment.duration).includes(time)) {
      return response.status(400).json({ error: "Choose an available appointment time." });
    }

    const booking = {
      name,
      email,
      mobile,
      location,
      service,
      duration: treatment.duration,
      price: treatment.price,
      currency: "INR",
      date,
      time,
      status: "pending",
      createdAt: new Date(),
    };

    try {
      const result = await request.app.locals.bookings.insertOne(booking);
      void notifyOwner(booking, result.insertedId.toString());
      return response.status(201).json({
        bookingId: result.insertedId.toString(),
        message: "Booking request saved for studio review.",
      });
    } catch (error) {
      console.error("Failed to save booking request to MongoDB.", error);
      return response.status(500).json({
        error: `We couldn’t save your request. Please try again or email ${ownerEmail}.`,
      });
    }
  },
);

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "The booking request could not be read. Please check the form and try again." });
  }
  console.error("Request failed.", error);
  return response.status(500).json({ error: "Something went wrong. Please try again later." });
});

async function startServer() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const database = client.db(databaseName);
  await database.collection("bookings").createIndex({ createdAt: -1 });
  app.locals.bookings = database.collection("bookings");

  const server = app.listen(port, () => {
    console.log(`Serein booking site listening on port ${port}.`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(async () => {
        await client.close();
        process.exit(0);
      });
    });
  }
}

startServer().catch((error) => {
  console.error("Unable to start the booking server or connect to MongoDB.", error);
  process.exit(1);
});
