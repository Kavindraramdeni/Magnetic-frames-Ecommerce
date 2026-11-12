# KRIA Tech — Storefront Pricing, Starter Kit & Subscription Analysis Report

**Generated:** 2026-11-12  
**Sources Analyzed:** `src/components/KriaTechPortfolioPage.tsx`, `src/data.ts`, `src/catalog.ts`, `index.html`

---

## 1. Storefront Unit Pricing & Bulk Tier Structure

### A. Core Portfolio Unit Prices (`KriaTechPortfolioPage.tsx`)
| Product | Size Options | Selling Price | MRP |
| :--- | :--- | :--- | :--- |
| **Classic Rectangle** | 3.5×2.5" / 3×4" / 6×4" | ₹229 / ₹279 / ₹349 | ₹329 / ₹379 / ₹499 |
| **Minimal Square** | 2×2" / 3×3" / 4×4" | ₹199 / ₹249 / ₹299 | ₹299 / ₹349 / ₹399 |
| **Minimal Circle** | 2×2" / 3×3" / 4×4" | ₹199 / ₹249 / ₹299 | ₹299 / ₹349 / ₹399 |
| **Sculpted Heart** | 2×2" / 3×3" / 4×4" | ₹199 / ₹249 / ₹299 | ₹299 / ₹349 / ₹399 |
| **Keychains** | 2.5" Circle / 3×3" Square | ₹149 / ₹179 | ₹249 / ₹279 |

### B. Return Gifts (`src/data.ts`)
- **All 4 Themes** (`rg-ganesha`, `rg-teddy`, `rg-wedding`, `rg-mandala`): **₹199** (MRP ₹299)

### C. Bulk Tiered Discounts (`QUANTITY_TIERS`)
| Order Quantity | Discount | Effective Price on ₹199 Frame | Effective Price on ₹279 Frame |
| :--- | :--- | :--- | :--- |
| **50 pcs** | 30% OFF | ~₹139 / pc | ~₹195 / pc |
| **100 pcs** | 35% OFF | ~₹129 / pc | ~₹181 / pc |
| **250 pcs** | 40% OFF | ~₹119 / pc | ~₹167 / pc |
| **500 pcs** | 45% OFF | ~₹109 / pc | ~₹153 / pc |
| **1,000 pcs** | 50% OFF | ~₹100 / pc | ~₹140 / pc |

---

## 2. Demo Starter Kit Analysis (₹999)

### Current Offer
- **Price:** ₹999 (Free pan-India air delivery)
- **Effective Per-Piece Cost:**
  - At **24 pieces** (20 frames + 4 bonus keychains, per `KriaTechPortfolioPage.tsx`): **₹41.63 / piece**
  - At **12 pieces** (10 frames + 2 bonus keychains, per `index.html` & alt text): **₹83.25 / piece**

### Key Findings & Risks
1. **Messaging Inconsistency Across Site:**
   - `KriaTechPortfolioPage.tsx` advertises **24 pieces (20 frames + 4 keychains)** for ₹999, while `index.html` (meta/OG/JSON-LD) and image alt text still say **12 pieces (10 frames + 2 keychains)**. This should be unified immediately so Google Search snippets and WhatsApp previews match the page.
2. **Cannibalization Risk vs. Bulk Tiers:**
   - At **₹41.63/pc** (24 pcs for ₹999), the Starter Kit is **58% cheaper per unit than the 1,000-piece bulk tier** (~₹100/pc) and **70% cheaper than the 50-piece tier** (~₹139/pc).
   - **Recommendation:** Explicitly mark the Demo Starter Kit as **"Limit 1 per business / first-time buyer"** and position it strictly as a **quality sample pack** (e.g., mixed shapes/sizes with KRIA sample prints or 1-time trial) so bulk buyers don't repeatedly buy ₹999 kits instead of 50–100 pc wholesale orders.

---

## 3. KRIA Subscription Analysis (₹499 / 3 Months)

### Current Offer
- **Fee:** ₹499 for 3 months (~₹166/month)
- **Benefits:**
  1. **₹2 OFF** on every frame
  2. **1-Day Dispatch** on ready frames
  3. **Customer Priority** support

### Break-Even & Unit Economics
- **Break-Even Volume:** `₹499 ÷ ₹2/frame = 250 frames` in 3 months (~83 frames/month).
- **Who Loses / Who Wins:**
  - **Small/Retail Buyers (5–30 frames/quarter):** Save only ₹10–₹60 on frames after paying ₹499 → **net loss** on discount math; low conversion incentive.
  - **Mid-Tier Stall Owners & Event Planners (100–200 frames/quarter):** Save ₹200–₹400 → still doesn't break even on the ₹2/frame perk alone.
  - **High-Volume Resellers (250+ frames/quarter):** Break even at 250 frames, and after that save ₹2/frame (~1.4%–2% extra margin on ₹100–₹139 bulk rates).

### Strategic Recommendations to Boost Subscription Conversions
1. **Increase Per-Frame Discount OR Add a Credited Welcome Benefit:**
   - Option A: Keep ₹499/3 months, change **₹2 OFF** → **₹5–₹10 OFF per frame** (break-even drops to **50–100 frames**, which matches your 50-pc and 100-pc bulk tiers!).
   - Option B: Keep ₹2 OFF per frame, but include **₹300–₹499 instant wallet/order credit** on their first bulk order of 50+ pcs (making the subscription feel "effectively free" for serious B2B buyers while locking them in for 3 months).
2. **Target the Subscription Explicitly at B2B Repeat Buyers:**
   - Rename/frame it as **"KRIA Pro / Reseller Pass (₹499 / Quarter)"** highlighting **1-Day Priority Dispatch** for urgent wedding/event orders—speed is often worth more than ₹2/pc to event planners and stall owners.
3. **Sync `kria-ai/knowledge-base/business-profile.md`:**
   - Update the `[TBD]` bulk tiers in the knowledge base to match the 30%–50% tiers already live in `KriaTechPortfolioPage.tsx` (once confirmed by owner).
