# Serein booking site

Booking requests are stored in MongoDB in the `bookings` collection with
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

The booking form submits to the server, which validates the request and saves it
as pending. The site does not automatically approve appointments or email
customers. After reviewing a request, contact the customer to confirm it.

The site needs a Node.js host that can reach MongoDB Atlas when deployed. The
host must provide `MONGODB_URI` and, optionally, `MONGODB_DB` and `PORT` as
environment variables. Do not publish the MongoDB connection string.

## Deploy to Render

1. Push this repository to GitHub and sign in to [Render](https://render.com/).
2. In the Render dashboard, choose **New → Blueprint**, select this GitHub
   repository, and apply the `render.yaml` configuration.
3. When prompted, enter the complete MongoDB Atlas connection string for
   `MONGODB_URI`. Keep it private; Render stores it as an environment variable.
4. In MongoDB Atlas Network Access, allow the outbound IP ranges shown for the
   Render service. Do not expose the database to all IP addresses.
5. Wait for the service deploy to finish, then open its `onrender.com` URL.

The free Render service may sleep when idle, so its first request after a period
of inactivity can take longer. Booking submissions require a reachable MongoDB
Atlas database.
