# receipt-landing-page

Landing page for eÚčtenka, served at https://euctenka.cz.

The site is plain static HTML in `public/`. It is hosted on Firebase Hosting as the
`euctenka-landing` site in the `euctenka` Firebase project, next to the web portal
(`euctenka.firebaseapp.com`).

## Deploy

- Push to `main`: deployed live by `.github/workflows/deploy.yml`.
- Pull request: deployed to a preview URL (expires after 7 days), posted as a PR comment.

Local preview and manual deploy:

```sh
npm install -g firebase-tools
firebase login
firebase emulators:start --only hosting   # http://localhost:5000
firebase deploy --only hosting:landing
```

## One-time setup

1. Create the hosting site: `firebase hosting:sites:create euctenka-landing --project euctenka`
   (or Firebase console > Hosting > Add another site).
2. Create a service account for CI: run `firebase init hosting:github` in this repo and let it
   create the `FIREBASE_SERVICE_ACCOUNT_EUCTENKA` secret, or create a service account with the
   **Firebase Hosting Admin** role and add its JSON key as that repository secret yourself.
   Never commit the key.
3. Custom domain: Firebase console > Hosting > `euctenka-landing` > Add custom domain, add
   `euctenka.cz` and `www.euctenka.cz`, then set the DNS records it shows at the domain registrar.
   Firebase issues the HTTPS certificate automatically.
