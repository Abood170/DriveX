# DRIVEX

A car showroom web app — browse vehicles by brand (BMW, Mercedes, Cadillac), view car details, and manage the fleet through an admin dashboard.

Runs entirely in the browser using `localStorage` — no build step, no database required to get started.

## Features

- Storefront with brand pages (BMW, Mercedes, Cadillac) filterable by category (Sports, SUV, EVs)
- Car detail page with price, condition, and features
- Admin dashboard to add, edit, and delete vehicles, with live fleet stats
- Simple login/register flow with an admin shortcut
- Access control on the dashboard — only an authenticated admin can reach it

## Tech stack

- HTML, CSS, vanilla JavaScript (no framework, no build tools)
- Data persistence via browser `localStorage`
- Optional backend: Express + MySQL (see below) for a real database-backed setup

## Getting started

No install needed. Just open the homepage in your browser:

```
store.html
```

### Login

- **Admin:** username `admin`, password `admin` — grants access to the dashboard.
- **Any other username/password** logs in as a regular user.

## Project structure

```
store/
├── store.html          # Homepage
├── bmw.html            # BMW brand page
├── Mercedes.html        # Mercedes brand page
├── Cadillac.html        # Cadillac brand page
├── car-single.html     # Car detail page
├── dashboard.html      # Admin dashboard (add/edit/delete cars)
├── signin.html         # Login page
├── Register.html       # Registration page
├── css/                 # Stylesheets
├── images/              # Static assets
└── js/
    ├── script.js        # Storefront/login logic (localStorage-based)
    ├── dashboard.js     # Dashboard CRUD logic (localStorage-based)
    └── server.js        # Optional Express + MySQL backend
```

## Optional: database-backed backend

`js/server.js` provides a real Express + MySQL API (register/login with hashed passwords, car CRUD) if you'd rather not rely on `localStorage`. It currently isn't wired to the frontend — the frontend uses `localStorage` by default.

To run it:

```bash
npm install
npm start
```

It connects to a local MySQL server (`root` user, no password by default — edit `dbConfig` in `js/server.js` to match your setup) and automatically creates the `drivex_db` database and required tables (`car`, `pepole`) on first run.

## Notes

- Fleet and user data live in the browser's `localStorage`, so clearing site data resets the showroom.
- Registration is client-side only for now; it doesn't validate against a real user store.
