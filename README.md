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
