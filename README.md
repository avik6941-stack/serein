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

## Deploy the static brochure to Vercel

The public Vercel deployment is intentionally static and brochure-only. It does
not include the Express booking API or collect appointment details. Contact the
studio by email to ask about availability. Use Vercel Hobby only for personal,
non-commercial demos; choose a plan and host whose terms permit commercial use
before using this site to promote a business.

1. Push the project to GitHub and import the repository in [Vercel](https://vercel.com/).
2. In the Vercel project settings, set **Root Directory** to `public`. This
   publishes only the static page and prevents the root `server.js` booking API
   from being deployed.
3. Keep the framework preset as **Other** and leave the build command empty.
   The static assets are `index.html`, `styles.css`, and `script.js`.
4. Deploy and assign a Vercel domain from the project settings. No MongoDB
   environment variables are needed for the brochure deployment.

To re-enable online bookings, deploy the Express server separately on a host
whose plan and terms support the intended use, then configure a valid
`MONGODB_URI` privately in that host's environment settings. Never put database
credentials in browser code or commit them to Git.
