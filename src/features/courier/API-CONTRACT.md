# Courier Operations API contract

All requests use the shared authenticated API client and Auth Service bearer JWT. Courier identity is resolved from the validated token and active mapping; the client never sends a courier identity.

## Courier profile

- GET /couriers/me through the configured Courier API base URL.
- Returns the authenticated courier profile.

## Assigned deliveries

GET /parcels/me/assigned-deliveries?page=0&size=20 through Gateway.

The response contains content with parcelId, assignmentId, trackingNumber, status, nullable scheduledDate, assignedAt, recipientName, recipientPhone and deliveryAddress, plus page, size and hasNext. Search and status filtering apply to the loaded page. The API does not provide pickup address or total-result count.

## Status management

PATCH /parcels/{parcelId}/status through Gateway accepts { "status": "in_transit" }, { "status": "failed", "failureReason": "recipient unavailable" }, or retry { "status": "in_transit" }. Parcel Service checks the authenticated courier mapping and active parcel assignment. Ordinary status updates cannot mark a parcel delivered.

## Proof of delivery

- POST /parcels/{parcelId}/delivery-otp issues/resends an email challenge only when the parcel has a verified recipient email and SMTP has accepted the message. The response contains a masked destination and expiry, never the code. A missing verified email returns 409; SMTP failure returns a sanitized 503 and the challenge is invalidated. The repository does not yet provide the trusted process that populates and verifies recipient email, so existing parcels fail closed.
- POST /parcels/{parcelId}/delivery-otp/verify accepts { "challengeId": "...", "code": "012345" }. OTPs are never returned by the server.
- POST /parcels/{parcelId}/delivery-photo?assignmentId={id} accepts multipart field photo (JPEG/PNG, at most 5 MiB).
- POST /parcels/{parcelId}/complete accepts { "challengeId": "...", "photoProofId": "..." } and requires both verified proofs.

Photo assets are authenticated/private in Cloudinary. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET only in the backend process environment. V7 records upload intents and a durable worker later reconciles unreferenced private assets; active and consumed proof evidence is retained. Tests mock Cloudinary and do not verify live provider access.
