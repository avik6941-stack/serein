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
   **Deploy from GitHub repo**. Select `avik6941-stack/serein` and the `main`
   branch. Railway detects the Node.js app and uses `npm start`.
2. In the service's **Variables** settings, add `MONGODB_URI` with the complete
   MongoDB Atlas connection string and `MONGODB_DB` with the value `serein`.
   Enter the URI directly in Railway; never commit it or share it publicly.
3. Configure MongoDB Atlas Network Access so the deployed service can reach
   the cluster.
4. In the service's **Settings → Networking**, generate a public domain and
   open it after the deployment succeeds.

Railway's Free plan includes $1 of monthly usage credit; resource use beyond
included credits may require a paid plan or incur charges. Check
[Railway pricing](https://railway.com/pricing) before deploying. Booking
submissions require a reachable MongoDB Atlas database.
