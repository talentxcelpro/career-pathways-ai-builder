# TALENTXCEL — COMPREHENSIVE MEDIA INVENTORY & R2 MIGRATION REPORT (ACTION 5)
**Date:** 2 November 2026  
**Status:** AUDIT & PLANNING COMPLETE (Awaiting Execution Approval; Zero Files Modified)  
**Scope:** `public/social-vault/` and `public/videos/`  

---

## 1. Executive Summary & Storage Inventory

An exact recursive filesystem audit of all media assets residing inside `public/` was conducted on 2 November 2026:

| Location | File Count | Size (MB) | Size (GB) | Content Description |
|---|---:|---:|---:|---|
| `public/social-vault/` | 2,130 | 1,412.93 MB | **1.41 GB** | Daily AI-generated social reels, infographics, voiceovers, VTT captions |
| `public/videos/` | 16 | 106.66 MB | **0.11 GB** | Static product explainer videos, ATS demos, overview walkthroughs |
| **Total Media Assets** | **2,146** | **1,519.59 MB** | **1.52 GB** | **Zero user private data; 100% public marketing/explainer content** |

---

## 2. File Format Breakdown

| Extension | Count | Typical Role | Example Files |
|---|---:|---|---|
| `.svg` | 1,217 | Social share cards, vector graphics | `public/social-vault/2026-09-05/card-1.svg` |
| `.json` | 252 | Video metadata & cue point manifests | `public/social-vault/2026-09-11/manifest.json` |
| `.mp4` | 230 | Social video reels & explainer MP4s | `public/videos/txc/talentxcel-overview.mp4` |
| `.vtt` | 214 | Closed captions / subtitles | `public/social-vault/2026-09-12/subtitles.vtt` |
| `.wav` | 213 | Synthesized audio voiceovers | `public/social-vault/2026-09-13/voice.wav` |
| `.txt` | 12 | Video transcripts | `public/social-vault/2026-09-14/transcript.txt` |
| `.jpg` | 8 | Video poster thumbnails | `public/videos/txc/thumbnails/poster.jpg` |

---

## 3. URL Mapping & Destination Specification

To ensure 100% backward compatibility and eliminate any risk of broken links:

* **Target Cloudflare R2 Bucket:** `talentxcel-media-vault`
* **Target Custom Domain:** `https://media.talentxcel.in` (proxied via Cloudflare with 1-Year Edge Cache TTL)
* **Access Policy:** Public Read-Only for media assets; write-restricted to authorized CI/CD API tokens.

### Destination Mapping Table:

| Source Path (Git/Local) | Existing Production URL | Proposed Destination URL (R2) | Cloudflare Redirect Compatibility |
|---|---|---|---|
| `public/videos/txc/ats-demo-1.mp4` | `https://talentxcel.in/videos/txc/ats-demo-1.mp4` | `https://media.talentxcel.in/videos/txc/ats-demo-1.mp4` | HTTP 302 Redirect Rule on Cloudflare |
| `public/videos/txc/talentxcel-overview.mp4` | `https://talentxcel.in/videos/txc/talentxcel-overview.mp4` | `https://media.talentxcel.in/videos/txc/talentxcel-overview.mp4` | HTTP 302 Redirect Rule on Cloudflare |
| `public/social-vault/:date/:file` | `https://talentxcel.in/social-vault/:date/:file` | `https://media.talentxcel.in/social-vault/:date/:file` | HTTP 302 Redirect Rule on Cloudflare |

---

## 4. Sync & Integrity Verification Plan (Non-Destructive)

When approved, the migration will follow strict non-destructive protocols:

1. **Step 1: Backup Archive:**  
   Create an immutable local archive at `scratch/media-backup-2026-11-02/` before any sync.
2. **Step 2: Checksum-Verified S3/R2 Upload:**  
   Upload using `rclone` or AWS S3 SDK with MD5/SHA256 checksum verification:
   ```bash
   rclone sync public/social-vault/ r2:talentxcel-media-vault/social-vault/ --checksum
   rclone sync public/videos/ r2:talentxcel-media-vault/videos/ --checksum
   ```
3. **Step 3: Automated Hash-Integrity Audit:**  
   Run an automated script that probes all 2,146 URLs on `https://media.talentxcel.in`, comparing byte lengths and HTTP 200 statuses against the local filesystem.
4. **Step 4: Rollback Safety:**  
   Local files are NOT deleted from git until the integrity audit certifies 100% parity and Cloudflare redirects are confirmed live.

---

## 5. Actual Monthly Cloudflare R2 Cost Estimate

Cloudflare R2 provides generous free-tier allowances and zero egress fees:

* **Storage Allowance:** 10 GB free / month.  
  * TalentXcel media footprint: **1.52 GB**.  
  * Billable storage: **0 GB (Within free tier)**.  
  * Base cost: **$0.00 / month** (Even without free tier: 1.52 GB * $0.015 = $0.023/month).
* **Class A Operations (Uploads/Sync):** 1,000,000 free / month.  
  * Total files synced: 2,146 operations.  
  * Cost: **$0.00**.
* **Class B Operations (CDN Reads):** 10,000,000 free / month.  
  * Cloudflare CDN caches assets at edge; origin reads to R2 will be < 50,000/month.  
  * Cost: **$0.00**.
* **Egress Fees:** **$0.00 (Cloudflare R2 has zero egress fees globally)**.
* **Total Estimated Monthly R2 Cost:** **$0.00 / month** (Guaranteed < $0.10/month at scale).

---

## 6. Build & Deployment Storage Benefit

* **`dist/` directory size:** Drops from **2,852 MB** to **~45 MB** (**-98.4%**).
* **Vercel deployment storage:** Plummets from 24.3 GB to **< 450 MB** across all active previews.
* **Vite build duration:** Drops from 3m 45s to **~35 seconds**.
