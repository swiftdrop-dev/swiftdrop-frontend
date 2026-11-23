# SwiftDrop — Frontend

SwiftDrop is a courier and parcel-delivery web application for Sri Lanka built with React 19, TypeScript, Vite, and React Router 7.

It provides responsive interfaces for five user roles:
- **Public**: Landing page, tracking by parcel number
- **Customer**: Parcel booking, fee estimation, delivery receipts, shipment history
- **Merchant**: Shipments, bulk CSV booking, API key management, webhook settings
- **Courier**: Assigned deliveries, in-transit status updates, proof of delivery (photo & OTP)
- **Dispatcher**: Operations dashboard, courier assignment, live fleet monitoring, analytics
- **Admin**: System KPIs, user role management, merchant onboarding review, pricing & zones

---

## 1. Prerequisites

- **Node.js 20.19+ or 22+**
- **npm 10+**
- SwiftDrop Backend / API Gateway running on `http://localhost:8079`

---

## 2. Quick Start

### Install Dependencies & Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, defaults provided)
cp .env.example .env

# 3. Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Production build artifacts are emitted to the `dist/` directory.

### Run Unit Tests

```bash
npm test -- --run
```

---

## 3. Running with Docker

The frontend is containerized using Nginx and can be run via Docker:

```bash
# Build Docker image
docker build -t swiftdrop-frontend .

# Run container on port 5173
docker run -d -p 5173:80 --name swiftdrop-frontend swiftdrop-frontend
```

Alternatively, start it via `docker compose` from the `swiftdrop-backend` directory.

---

## 4. Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@swiftdrop.lk` | `Admin@123` |
| **Dispatcher** | `dispatcher@swiftdrop.lk` | `Dispatcher@123` |
| **Courier** | `courier@swiftdrop.lk` | `Courier@123` |
| **Merchant** | `merchant@swiftdrop.lk` | `Merchant@123` |
| **Customer** | `customer@swiftdrop.lk` | `Customer@123` |
