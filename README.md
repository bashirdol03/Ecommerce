# 🛒 E-Commerce Web App

This is a full-stack **E-Commerce platform** I built using the **MERN stack** (MongoDB, Express, React, Node.js), inspired by freelance marketplaces like Fiverr, but adapted for product listings and orders.

The core idea was to build something functional and secure, where users can sign up, browse listings, place orders, and leave reviews — while sellers can manage their own services. 

Most of my time and effort went into developing a solid backend, with a strong focus on authentication, sessions, testing, and security best practices. The frontend is pretty simple, but it was the backend architecture that I really wanted to get right.


👉 **Live Demo**: [https://app2.mybackendserver.pro(https://app2.mybackendserver.pro)

---

## 🚀 Demo Accounts

Feel free to test the app using one of the following demo accounts:

Email: demouser1@myapp.com
Password: Password1@ 

Email: demouser2@myapp.com
Password: Password1@ 

🕒 **Note**: The app may take a few seconds to load on first visit since it's hosted on Render's free tier, which puts the server to sleep when idle.

## ⚙️ Tech Stack

- **Frontend**: React, SCSS  
- **Backend**: Node.js, Express.js, MongoDB  
- **Authentication**: Google OAuth 2.0 & session-based login  
- **Session Management**: `express-session` with persistent storage in MongoDB  
- **Storage**: Cloudinary for image uploads (handled on the **frontend**)  
- **Testing**: Supertest with `supertest-session` for session-based integration tests  
- **Security**: Helmet, XSS-clean, express-mongo-sanitize, express-rate-limit  
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## ✨ Features

### 🔐 Authentication & Session Security
- Register/login with email + password (includes password strength validation & confirmation)
- Google OAuth 2.0 login
- Session cookies scoped to `.mybackendserver.pro`, configured with:
  - `SameSite=None`
  - `Secure: true`
  - `HttpOnly: true`
- Secure logout and login restrictions across sessions

### 👤 User Roles
- **Buyer**: Browse gigs, place orders, and review only completed orders
- **Seller**: Manage their own gigs and confirm incoming orders
- Sellers **cannot** purchase or review their own gigs (enforced server-side)

### 🛍️ Gig & Order Management
- Full CRUD support for gigs
- Buyers can place orders on any public listing
- Sellers can confirm or reject orders
- Buyers may only leave reviews on completed purchases


---

## 🧪 Integration Testing

- Full coverage of **auth**, **gig**, **review**, and **order** routes
- Testing done using `Supertest` and `supertest-session` to simulate real user sessions
- Custom test database (MongoDB) ensures test isolation
- Tests verify:
  - Role-based access restrictions
  - Session persistence across requests
  - Form validation and error responses
  - Security boundaries (e.g., session hijacking prevention)

---

## 🛡️ Security

- **Helmet** for secure HTTP headers  
- **XSS-clean** and **express-mongo-sanitize** to prevent injection attacks  
- **Rate-limiting** to protect auth routes from brute-force attacks  
- **Compression** and **payload size limiting** to optimize performance and security  
- Secure cookies and domain-specific session isolation

---

## 🌱 Future Improvements

- 💳 Stripe integration for real payments  
- 💬 Real-time messaging using WebSockets  
- 🧾 Admin dashboard for user/session control  
- 📩 Email alerts on order status updates  
- 🧪 Unit tests with CI/CD workflow for production deployment

---



## 🌐 Deployment Notes

- Subdomains are used (e.g., `app2.mybackendserver.pro` for frontend, `mybackendserver.pro` for backend) to **ensure session cookies** work reliably across environments — especially in Safari, which blocks third-party cookies.
- All sensitive config (API keys, database URIs, secrets, etc.) is managed using `.env` environment variables and not hardcoded.


## 💡 Notes

This project focuses on backend functionality and logic. The frontend is minimal and practical to prioritize performance and usability.  

## 📁 Local Setup

```bash
# Clone the repository
git clone https://github.com/your-username/Ecommerce.git

# Install dependencies
cd client && npm install
cd ../server && npm install

# Start the servers
npm run dev

