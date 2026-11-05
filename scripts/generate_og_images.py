import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.abspath("public/assets/og")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colors
BG_DARK = (11, 15, 25)        # #0B0F19
BG_GRAD_END = (15, 23, 42)    # #0F172A
ACCENT_BLUE = (59, 130, 246)  # #3B82F6
ACCENT_CYAN = (14, 165, 233)  # #0EA5E9
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (148, 163, 184)  # #94A3B8
CARD_BG = (17, 24, 39, 200)   # #111827 with alpha
BORDER_COLOR = (30, 41, 59)   # #1E293B

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_SEMI = "C:/Windows/Fonts/segoeuisl.ttf" if os.path.exists("C:/Windows/Fonts/segoeuisl.ttf") else FONT_REG

title_font = ImageFont.truetype(FONT_BOLD, 48)
subtitle_font = ImageFont.truetype(FONT_REG, 24)
badge_font = ImageFont.truetype(FONT_BOLD, 18)
brand_font = ImageFont.truetype(FONT_BOLD, 36)
url_font = ImageFont.truetype(FONT_BOLD, 22)
meta_font = ImageFont.truetype(FONT_REG, 18)

CARDS = [
    {
        "filename": "talentxcel-og-default.png",
        "badge": "GLOBAL CAREER PLATFORM & RECRUITER OS",
        "title": "Global Career Platform, Jobs\n& Verified Career Passport",
        "subtitle": "Connect with tech and leadership talent worldwide. Verify skills\nwith TalentScore, explore 50+ hubs, and access ATS tools.",
        "tagline": "Verified Talent Network • 50+ Global Hubs • ATS Intelligence"
    },
    {
        "filename": "talentxcel-og-jobs.png",
        "badge": "VERIFIED TECH & LEADERSHIP JOBS",
        "title": "Verified High-Growth Careers\n& Direct Recruiter Apply",
        "subtitle": "Explore verified job openings across Bangalore, London, Dubai & Remote.\nTransparent employment terms, salary benchmarks, and fast apply.",
        "tagline": "Zero Stale Listings • Verified Salaries • Direct Hiring"
    },
    {
        "filename": "talentxcel-og-passport.png",
        "badge": "CAREER PASSPORT & TALENT INTELLIGENCE",
        "title": "Career Passport — Cryptographically\nVerified Professional Identity",
        "subtitle": "Prove your skills with real TalentScore benchmarks, verified credentials,\nand shareable recruiter-grade candidate profiles.",
        "tagline": "Verifiable Trust Score • 0% Fake Credentials • Global Standard"
    },
    {
        "filename": "talentxcel-og-salaries.png",
        "badge": "SALARY BENCHMARKS & COMPENSATION INTELLIGENCE",
        "title": "2026 Technology Salary Guides\n& Compensation Benchmarks",
        "subtitle": "Verified in-hand take-home compensation curves, percentile ranges,\nand employer market data across India and top global hubs.",
        "tagline": "Real In-Hand Pay • 50+ Roles • Tier-1 & Tier-2 Benchmarks"
    },
    {
        "filename": "talentxcel-og-colleges.png",
        "badge": "COLLEGES & CAMPUS RECRUITMENT",
        "title": "Higher Education & Campus\nPlacement Intelligence 2026",
        "subtitle": "Verified placement statistics, company cutoffs, engineering rankings,\nand campus talent pipelines for recruiters and graduates.",
        "tagline": "NIRF Statistics • Placement Records • Campus Screening"
    },
    {
        "filename": "talentxcel-og-resume.png",
        "badge": "AI-POWERED ATS RESUME BUILDER",
        "title": "AI-Powered ATS Resume Builder\n& Recruiter Parseability Audit",
        "subtitle": "Audit your resume against top applicant tracking systems in 10 seconds.\nOptimized keywords, verified formats, and export to PDF/DOCX.",
        "tagline": "100% Free Audit • ATS-Optimized Formats • Live Scoring"
    },
    {
        "filename": "talentxcel-og-article.png",
        "badge": "CAREER PLAYBOOKS & STRATEGIC INSIGHTS",
        "title": "Career Intelligence, Interview Playbooks\n& Executive Hiring Frameworks",
        "subtitle": "Actionable methodologies, STAR interview questions, and career transition\nstrategies curated by senior engineering leaders.",
        "tagline": "Expert Methodologies • Interview Guides • Career Growth"
    }
]

def create_card(card_def):
    # Base 1200x630 Canvas
    img = Image.new("RGBA", (1200, 630), BG_DARK)
    draw = ImageDraw.Draw(img)

    # 1. Background Gradient Simulation
    for y in range(630):
        # Vertical blend
        ratio = y / 630.0
        r = int(BG_DARK[0] * (1 - ratio * 0.4) + BG_GRAD_END[0] * (ratio * 0.4))
        g = int(BG_DARK[1] * (1 - ratio * 0.4) + BG_GRAD_END[1] * (ratio * 0.4))
        b = int(BG_DARK[2] * (1 - ratio * 0.4) + BG_GRAD_END[2] * (ratio * 0.4))
        draw.line([(0, y), (1200, y)], fill=(r, g, b))

    # 2. Ambient Blue Glow in Top Right and Bottom Left
    glow = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    
    # Top-right radial glow
    for radius in range(400, 50, -25):
        alpha = int((1.0 - radius / 400.0) * 45)
        glow_draw.ellipse([900 - radius, 120 - radius, 900 + radius, 120 + radius], fill=(59, 130, 246, alpha))
    
    # Bottom-left subtle cyan glow
    for radius in range(350, 50, -25):
        alpha = int((1.0 - radius / 350.0) * 35)
        glow_draw.ellipse([200 - radius, 550 - radius, 200 + radius, 550 + radius], fill=(14, 165, 233, alpha))

    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # 3. Outer Border Frame (Subtle 1px border)
    draw.rectangle([16, 16, 1183, 613], outline=(30, 41, 59), width=1)
    
    # 4. Top Brand Header
    # Brand Icon chip
    draw.rounded_rectangle([72, 54, 112, 94], radius=10, fill=(37, 99, 235))
    # "TX" inside chip
    chip_font = ImageFont.truetype(FONT_BOLD, 22)
    draw.text((80, 62), "TX", font=chip_font, fill=TEXT_WHITE)

    # Brand Title: "Talent" in white, "Xcel" in blue
    draw.text((126, 56), "Talent", font=brand_font, fill=TEXT_WHITE)
    talent_w = draw.textlength("Talent", font=brand_font)
    draw.text((126 + talent_w, 56), "Xcel", font=brand_font, fill=(96, 165, 250))

    # Domain indicator on top right
    url_box_x = 940
    draw.rounded_rectangle([url_box_x - 16, 58, 1128, 92], radius=16, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    draw.text((url_box_x, 64), "talentxcel.in", font=url_font, fill=(147, 197, 253))

    # 5. Category Pill / Badge
    badge_text = card_def["badge"]
    badge_w = draw.textlength(badge_text, font=badge_font)
    badge_box = [72, 136, 72 + badge_w + 32, 172]
    draw.rounded_rectangle(badge_box, radius=18, fill=(30, 58, 138, 180), outline=(59, 130, 246), width=1)
    draw.text((88, 144), badge_text, font=badge_font, fill=(191, 219, 254))

    # 6. Headline (Title)
    title_y = 196
    lines = card_def["title"].split("\n")
    for line in lines:
        draw.text((72, title_y), line, font=title_font, fill=TEXT_WHITE)
        title_y += 58

    # 7. Subtitle
    sub_y = title_y + 12
    sub_lines = card_def["subtitle"].split("\n")
    for s_line in sub_lines:
        draw.text((72, sub_y), s_line, font=subtitle_font, fill=TEXT_MUTED)
        sub_y += 34

    # 8. Bottom Footer Divider and Badges
    footer_y = 550
    # Gradient accent bar
    draw.line([(72, footer_y), (400, footer_y)], fill=(59, 130, 246), width=2)
    draw.line([(400, footer_y), (1128, footer_y)], fill=(30, 41, 59), width=1)

    # Footer Tagline text
    draw.text((72, footer_y + 18), card_def["tagline"], font=meta_font, fill=(148, 163, 184))

    # Official verification badge on right
    v_badge = "Verified Official Preview"
    v_w = draw.textlength(v_badge, font=meta_font)
    draw.text((1128 - v_w, footer_y + 18), v_badge, font=meta_font, fill=(59, 130, 246))

    # Convert to RGB (standard web format) and save with optimization
    final_img = img.convert("RGB")
    out_path = os.path.join(OUTPUT_DIR, card_def["filename"])
    final_img.save(out_path, format="PNG", optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"Generated: {card_def['filename']} | 1200x630 | {size_kb:.1f} KB")

print("Generating 1200x630 Open Graph branded card suite...")
for card in CARDS:
    create_card(card)
print("Complete.")
