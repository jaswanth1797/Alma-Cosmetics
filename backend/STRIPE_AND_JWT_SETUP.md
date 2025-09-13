# Razorpay and JWT Setup

This guide explains how to configure JSON Web Token (JWT) authentication and Razorpay payments for the backend. Environment variables use placeholders and must be set in your deployment platform.

## 1) Environment Variables
Create a `.env` file in `backend/` (do not commit it) with the following keys:

```
PORT=5000
MONGO_URI=YOUR_MONGODB_ATLAS_URI
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
CLIENT_URLS=http://127.0.0.1:5501,http://localhost:5501
```

- MONGO_URI: MongoDB Atlas connection string.
- JWT_SECRET: Long random string for signing JWTs.
- RAZORPAY_KEY_ID: Razorpay Key ID from the Razorpay Dashboard.
- RAZORPAY_KEY_SECRET: Razorpay Key Secret from the Razorpay Dashboard.
- CLIENT_URLS: Comma-separated list of allowed frontend origins.

On Render/Railway, add these as environment variables in the service settings instead of using a `.env` file.

## 2) Install & Run (Local)
From `backend/`:

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000` by default.

## 3) JWT Authentication
- Login and Register endpoints issue a JWT stored in an HttpOnly cookie named `token`.
- Cookies are set with `httpOnly=true`, `sameSite=lax`, and `secure` in production.
- Protected routes use the `protect` middleware to validate the cookie and attach `req.user`.
- Admin-only routes additionally require the `admin` middleware.

### Endpoints
- POST `/api/users/register` → `{ name, email, password }`
- POST `/api/users/login` → `{ email, password }`
- POST `/api/users/logout`
- GET `/api/users/profile` (protected)

### Frontend Notes
- Include cookies on requests:
```js
fetch(`${API_BASE}/api/users/profile`, { credentials: 'include' })
```
- Ensure CORS allows your frontend origin (`CLIENT_URL`) and `credentials: true` on the server.

## 4) Razorpay Payments (Test Mode)
This backend uses Razorpay for payment processing with a simple order creation and verification flow.

### Payment Flow
- POST `/api/orders/razorpay` (protected)
  - Body: `{ items: [{ productId, quantity }] }`
  - Returns: `{ orderId, razorpayOrderId, amount, currency, key }`
- Frontend opens Razorpay checkout modal with the returned data.
- On successful payment, POST `/api/orders/razorpay/verify` with payment details to verify and complete the order.

### Required Keys
- Use your Razorpay test mode Key ID and Key Secret.
- Never expose secret keys in the frontend.

### Test Cards
Use Razorpay test cards:
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- Any future expiry, any CVV, any name.

## 5) CORS, Cookies, Deployment
- Server uses `cors({ origin: CLIENT_URLS.split(','), credentials: true })`.
- In production, set `CLIENT_URLS` to comma-separated frontend domains (Netlify/Vercel).
- Cookies are sent only over HTTPS in production (`secure: true`). Ensure both frontend and backend use HTTPS.

## 6) Admin Role
- Users have `role`: `user` or `admin`.
- Admin-only product/order routes require both `protect` and `admin`.

## 7) Seeding Products (optional)
Insert sample products via MongoDB Atlas UI or a small script with fields:
```
{ name, brand, description, price, stock, image }
```
`image` should be a publicly accessible URL for thumbnails.

## 8) Troubleshooting
- 401 Not authorized: Confirm cookie is set; use `credentials: 'include'`; `CLIENT_URLS` includes frontend origin; `JWT_SECRET` set.
- Razorpay errors: Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct, test mode enabled, amounts are in paise.
- CORS issues: Check exact origin (no trailing slash), `credentials: true` on server and client requests.
- Cart persistence: Check browser localStorage for 'alma_cart' key.
