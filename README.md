# Serein appointment request site

Appointment requests are stored in MongoDB in the `bookings` collection with
`status: "pending"`. Review them in MongoDB Atlas under **Database → Browse
Collections**. No public endpoint exposes customer booking records.

## Run locally

1. Install Node.js 20 or newer.
2. Create a MongoDB Atlas database and database user. In Atlas Network Access,
   allow the IP address where this server will run.
3. Open the `.env` file in this folder and paste your Atlas connection URI after
   `MONGODB_URI=`. Leave `MONGODB_DB` and `PORT` as they are. Keep `.env`
   private; it is ignored by Git. Never put the MongoDB URI in browser code or
   share it publicly.
4. Open a terminal in this folder and run `npm install` followed by `npm start`.
5. Open `http://localhost:3000` (do not open `index.html` directly from disk).

The appointment request form submits to `/api/appointment-requests`. The server
validates and stores each request as pending; it does not reserve a time or
confirm an appointment. Email notifications are optional. Review a request and
contact the customer to confirm it.

The site needs a Node.js host that can reach MongoDB Atlas when deployed. The
host must provide `MONGODB_URI` and, optionally, `MONGODB_DB` and `PORT` as
environment variables. Do not publish the MongoDB connection string.

## Deploy the appointment request app on Railway

The app must be deployed from the repository root so Railway runs the Express
server and serves the files in `public/`. Do not set `public/` as the root:
that would omit the request endpoint.

1. Create a Railway project and deploy this GitHub repository as a service.
   Select the repository root. Railway can start the app with `npm start`.
2. In the service's **Variables** settings, add `MONGODB_URI` as a secret and
   set `MONGODB_DB` to `serein`. Optionally add `NOTIFY_EMAIL` and
   `RESEND_API_KEY` for owner email notifications. Never commit or share the
   database URI.
3. Configure MongoDB Atlas Network Access to allow the app host's outbound
   connection. Use a valid database user and connection string; do not allow
   all IP addresses unless you explicitly accept that exposure.
4. Generate a Railway public domain and verify an appointment request is saved
   with `status: "pending"` before sharing the site. Add a custom domain later
   in Railway when one has been purchased.

The existing Vercel project is configured as a static brochure and does not
run the request server. Vercel Hobby is restricted to personal, non-commercial
use; use a host and plan that permit the intended business use before
publishing customer appointment requests.
