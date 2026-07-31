# KRIA Studio Ecommerce

Full-stack React/Vite + Express storefront for custom acrylic photo magnets.

## Run locally

```bash
npm install
ENABLE_MOCK_CHECKOUT=true ADMIN_PASSWORD=change-me npm run dev
```

## Production requirements

Set these environment variables before accepting real orders:

- `NODE_ENV=production`
- `ADMIN_PASSWORD` or `ADMIN_TOKEN` to protect `/api/admin/*`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` to enable real prepaid checkout plus server-side payment capture recovery
- `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` to create shipments and serviceability checks
- `EMAIL_WEBHOOK_URL`, `SMS_WEBHOOK_URL`, and `WHATSAPP_WEBHOOK_URL` for real customer notifications; `NOTIFICATION_WEBHOOK_URL` remains a generic fallback
- `DATABASE_URL=sqlite:/path/to/kria.sqlite` or `DATA_DIR=/persistent/data` for persistent SQLite storage
- `OBJECT_STORAGE_DIR=/persistent/uploads` for secure uploaded photo object storage

Mock checkout is intentionally disabled in production. It only works when `ENABLE_MOCK_CHECKOUT=true` and `NODE_ENV` is not `production`.

## Checks

```bash
npm run lint
npm run build
```

## Go-live safeguards now included

- `/api/admin/*` routes require bearer-token authentication.
- `/api/webhooks/razorpay` records signed payment events and can recover paid orders if the browser closes before checkout callback completion.
- `/api/orders/track` gives customers a limited order-status lookup using order ID plus email or phone.
- API rate limiting and basic cart/shipping validation protect checkout and admin endpoints from malformed or abusive traffic.
