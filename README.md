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

## Deploy to Railway

1. Sign in to [Railway](https://railway.com/) and create a project using
   **Deploy from GitHub Repo**. Select this repository and deploy the root
   directory.
2. Railway should detect the Node.js app and use `npm start`. If needed, set
   the service start command to `npm start` in its settings.
3. Add these service variables in Railway:
   - `MONGODB_URI`: your MongoDB Atlas connection string. Rotate the database
     password if it was shared, and add the replacement here as a secret.
   - `MONGODB_DB`: `serein`
   - `NOTIFY_EMAIL`: the address that should receive booking notifications
   - `RESEND_API_KEY`: optional; add a Resend API key to enable email notices
4. Railway supplies `PORT` automatically. In MongoDB Atlas Network Access,
   configure access for the Railway service's outbound network. Avoid broad
   allowlists unless you accept the additional database exposure.
5. After the first deployment succeeds, generate a public domain in the
   Railway service's **Settings → Networking** section.

Railway currently lists its Free plan as including $1/month in usage credits;
its $5 trial credit is one-time and expires after 30 days. This may not cover
the service's monthly usage, so check the current [Railway pricing](https://railway.com/pricing)
before relying on it as a free production host. Booking submissions require a
reachable MongoDB Atlas database.
