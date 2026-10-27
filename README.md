# Serein appointment request site

The public brochure links to a Google Form for appointment requests. Google
Forms collects responses in the account owner's linked Google Sheet; the site
does not reserve or confirm appointments.

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

## Deploy the public appointment request site

The website's appointment request buttons open the Google Form configured in
`public/index.html`. Responses are collected by Google Forms; this static site
does not need the Express server or MongoDB.

To publish the static site on Cloudflare Pages:

1. In Cloudflare, go to **Workers & Pages → Create application → Pages →
   Connect to Git** and select this GitHub repository.
2. Select the `setup/google-forms-request-link` branch as the production
   branch. Set the build command to empty and the build output directory to
   `public`.
3. Deploy the site and use its `pages.dev` address. A custom domain can be
   connected later.
4. Keep the Google response Sheet private and review it regularly. The form
   currently collects contact information, treatment, location, and a
   preferred date. The form itself must state how customers' personal
   information is used and who can access responses.

The existing Vercel Hobby project is a personal demo; its terms do not allow
using that plan to promote a business. Do not deploy the business site there.
The Express/MongoDB endpoint is kept separately for a future server deployment
if needed.
