# SwiftDrop — Frontend

SwiftDrop is a courier and parcel-delivery platform for Sri Lanka. This repository is the web frontend: one React app that serves four roles — **customers**, **merchants**, **couriers** and **dispatchers** — plus a public parcel-tracking page.



---

## Features

| Role | What they can do | Routes |
|---|---|---|
| **Public** | Landing page, track any parcel by tracking number | `/`, `/track` |
| **Customer** | Dashboard, book a parcel (multi-step form with live fee estimate), view and filter their parcels, view delivery receipts | `/customer`, `/customer/book`, `/customer/parcels` |
| **Merchant** | Business dashboard with charts, single and bulk booking, all shipments | `/merchant`, `/merchant/book`, `/merchant/bulk`, `/merchant/parcels` |
| **Courier** | Duty dashboard, assigned deliveries with status updates, proof of delivery (photo + signature) | `/courier`, `/courier/deliveries`, `/courier/proof` |
| **Dispatcher** | Operations dashboard, all parcels, assign couriers, reports and courier performance | `/dispatcher`, `/dispatcher/parcels`, `/dispatcher/assign`, `/dispatcher/reports` |

Role routes are protected: signing in sends each user to their own dashboard, and opening another role's route redirects to `/`.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **React Router 7** for routing and role-protected routes
- **TanStack Query** (provider configured, ready for API calls)
- **Axios** API client (`src/lib/api-client.ts`)
- **React Hook Form** + **Zod** (installed for form validation)
- **lucide-react** icons
- Plain CSS design system with CSS variables (`src/index.css`) — no UI framework
- **Oxlint** for linting, **Prettier** for formatting

## Getting started

### Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8)
- npm

### Install and run

```bash
git clone https://github.com/swiftdrop-dev/swiftdrop-frontend.git
cd swiftdrop-frontend
npm install
cp .env.example .env     
npm run dev
```

The app runs at <http://localhost:5173>.

### Demo accounts

On the login page, click one of the **Quick demo login** buttons, or sign in manually with any of these emails. The password is not checked by the mock auth, so any value works (the demo buttons fill in `demo1234`).

| Role | Email |
|---|---|
| Customer | `customer@demo.com` |
| Merchant | `merchant@demo.com` |
| Courier | `courier@demo.com` |
| Dispatcher | `dispatcher@demo.com` |

To try public tracking, open `/track` and enter a mock tracking number such as `SWF-2024-001234` (delivered) or `SWF-2024-001235` (in transit).



## Environment variables

Copy `.env.example` to `.env` and adjust as needed. Both have defaults, so the app runs without a `.env` file.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_APP_NAME` | `SwiftDrop` | App name constant |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base URL for the backend API client |

`.env` is git-ignored

## Project structure

```text
src/
├── app/
│   ├── providers/AppProviders.tsx   # React Query, Auth and Toast providers
│   └── router/AppRouter.tsx         # All routes and role redirects
├── components/
│   ├── layout/                      # DashboardLayout, Sidebar, Header
│   └── shared/                      # LandingPage, AuthAside, SharedComponents
│                                    #   (StatusBadge, StatusTimeline, StatCard, Modal,
│                                    #    EmptyState, SimpleBarChart, ProtectedRoute, Toasts)
├── features/                        # One folder per domain
│   ├── auth/        (context/AuthContext.tsx, pages/Login, Register)
│   ├── customer/    (Dashboard, BookParcel, MyParcels)
│   ├── merchant/    (Dashboard, BulkBooking, MerchantParcels)
│   ├── courier/     (Dashboard, AssignedDeliveries, ProofOfDelivery)
│   ├── dispatcher/  (Dashboard, DispatcherParcels, AssignCourier, Reports)
│   ├── tracking/    (PublicTracking)
│   ├── admin/       # placeholder
│   └── chatbot/     # placeholder
├── lib/
│   ├── api-client.ts                # Axios instance
│   └── mockData.ts                  # Mock users, couriers, parcels, reports
├── services/auth.service.ts         # API auth calls (not yet used by the UI)
├── types/global.types.ts            # Shared TypeScript types
├── utils/constants.ts               # Env-backed constants
├── index.css                        # Design system and all component styles
└── main.tsx
```




