import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Ganesha Keepsake Frame SVG
const ganeshaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="g_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4A0E17"/>
      <stop offset="50%" stop-color="#2B060C"/>
      <stop offset="100%" stop-color="#150205"/>
    </linearGradient>
    <linearGradient id="g_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE5A3"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#AA7C11"/>
    </linearGradient>
    <filter id="g_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="600" height="800" fill="url(#g_bg)" />
  <rect x="30" y="30" width="540" height="740" rx="24" fill="none" stroke="url(#g_gold)" stroke-width="2" opacity="0.6" />
  <rect x="44" y="44" width="512" height="712" rx="16" fill="none" stroke="url(#g_gold)" stroke-width="1" stroke-dasharray="6 6" opacity="0.4" />
  
  <circle cx="300" cy="350" r="160" fill="none" stroke="url(#g_gold)" stroke-width="1.5" opacity="0.3" />
  <circle cx="300" cy="350" r="140" fill="none" stroke="url(#g_gold)" stroke-width="1" stroke-dasharray="4 8" opacity="0.5" />
  
  <g transform="translate(300, 340) scale(1.1)" stroke="url(#g_gold)" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#g_glow)">
    <path d="M-12 -120 Q0 -150 12 -120 Q0 -130 -12 -120" fill="url(#g_gold)" stroke-width="2" />
    <circle cx="0" cy="-105" r="4" fill="url(#g_gold)" />
    <path d="M-25 -95 Q0 -85 25 -95" stroke-width="3" />
    <path d="M-30 -85 Q0 -75 30 -85" stroke-width="2" />
    <path d="M-30 -85 C-110 -80 -120 0 -45 40" stroke-width="4" />
    <path d="M30 -85 C110 -80 120 0 45 40" stroke-width="4" />
    <path d="M-20 -70 C40 -65 50 -10 10 20 C-30 50 -10 110 30 110 C50 110 65 95 65 75" stroke-width="5" />
    <path d="M-35 30 L-50 35" stroke-width="4" />
    <circle cx="65" cy="75" r="10" fill="url(#g_gold)" />
  </g>
  
  <text x="300" y="580" text-anchor="middle" fill="url(#g_gold)" font-family="serif" font-size="32" letter-spacing="6" font-weight="bold">SHUBH LABH</text>
  <text x="300" y="630" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-size="24" letter-spacing="2" opacity="0.95">DIVINE BLESSINGS</text>
  <text x="300" y="665" text-anchor="middle" fill="url(#g_gold)" font-family="sans-serif" font-size="14" letter-spacing="3" opacity="0.8">LUXURY ACRYLIC KEEPSAKE</text>
  <text x="300" y="700" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-style="italic" font-size="13" opacity="0.6">May joy, peace and prosperity fill your home</text>
</svg>`;

// 2. Birthday Nursery Teddy SVG
const teddySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="t_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBF2"/>
      <stop offset="50%" stop-color="#F9F1E2"/>
      <stop offset="100%" stop-color="#EFE2CC"/>
    </linearGradient>
    <linearGradient id="t_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#t_bg)" />
  <rect x="25" y="25" width="550" height="550" rx="36" fill="none" stroke="#D8C8B0" stroke-width="2" />
  <rect x="35" y="35" width="530" height="530" rx="28" fill="none" stroke="#C4A574" stroke-width="1" stroke-dasharray="8 8" />
  
  <g transform="translate(380, 150)">
    <ellipse cx="0" cy="0" rx="35" ry="45" fill="#E5B299" opacity="0.85" />
    <path d="M0 45 Q-10 120 10 180" stroke="#AA8C72" fill="none" stroke-width="1.5" />
  </g>
  <g transform="translate(340, 120)">
    <ellipse cx="0" cy="0" rx="38" ry="48" fill="#C4A574" opacity="0.75" />
    <path d="M0 48 Q20 120 50 210" stroke="#AA8C72" fill="none" stroke-width="1.5" />
  </g>
  <g transform="translate(420, 130)">
    <ellipse cx="0" cy="0" rx="32" ry="42" fill="#D9C5B2" opacity="0.8" />
    <path d="M0 42 Q-30 110 -30 200" stroke="#AA8C72" fill="none" stroke-width="1.5" />
  </g>
  
  <text x="100" y="120" fill="#C4A574" font-size="24">★</text>
  <text x="480" y="220" fill="#D8A48F" font-size="20">★</text>
  <text x="140" y="260" fill="#C4A574" font-size="18">★</text>
  
  <g transform="translate(250, 310)">
    <circle cx="-45" cy="-50" r="24" fill="#B58A63" />
    <circle cx="-45" cy="-50" r="14" fill="#E6C8AE" />
    <circle cx="45" cy="-50" r="24" fill="#B58A63" />
    <circle cx="45" cy="-50" r="14" fill="#E6C8AE" />
    <circle cx="0" cy="-15" r="55" fill="#C69B72" />
    <ellipse cx="0" cy="-2" rx="26" ry="20" fill="#F4E2D0" />
    <ellipse cx="0" cy="-10" rx="8" ry="6" fill="#4A2E18" />
    <path d="M0 -4 L0 6 M-8 6 Q0 12 8 6" stroke="#4A2E18" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <circle cx="-20" cy="-20" r="5" fill="#331D0C" />
    <circle cx="-18" cy="-22" r="1.8" fill="#FFF" />
    <circle cx="20" cy="-20" r="5" fill="#331D0C" />
    <circle cx="22" cy="-22" r="1.8" fill="#FFF" />
    <circle cx="-32" cy="-10" r="8" fill="#E5A995" opacity="0.5" />
    <circle cx="32" cy="-10" r="8" fill="#E5A995" opacity="0.5" />
    <ellipse cx="0" cy="75" rx="48" ry="40" fill="#B58A63" />
    <polygon points="-15,35 0,42 -15,49" fill="#D4AF37" />
    <polygon points="15,35 0,42 15,49" fill="#D4AF37" />
    <circle cx="0" cy="42" r="4" fill="#996515" />
  </g>
  
  <text x="300" y="460" text-anchor="middle" fill="#4A2E18" font-family="serif" font-size="24" font-weight="bold" letter-spacing="2">BABY JOY &amp; CELEBRATION</text>
  <text x="300" y="495" text-anchor="middle" fill="#8C6747" font-family="sans-serif" font-size="14" letter-spacing="3">1ST BIRTHDAY &amp; BABY SHOWER FAVOR</text>
  <text x="300" y="530" text-anchor="middle" fill="#A88363" font-family="serif" font-style="italic" font-size="13">"Thank you for blessing our little bundle of joy"</text>
</svg>`;

// 3. Wedding Monogram SVG
const weddingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="w_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F2421"/>
      <stop offset="100%" stop-color="#0F1210"/>
    </linearGradient>
    <linearGradient id="w_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F9E7B9"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#9E782F"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#w_bg)" />
  <rect x="35" y="35" width="530" height="730" rx="20" fill="none" stroke="url(#w_gold)" stroke-width="1.5" opacity="0.7" />
  <rect x="48" y="48" width="504" height="704" rx="14" fill="none" stroke="url(#w_gold)" stroke-width="0.8" stroke-dasharray="5 5" opacity="0.5" />
  
  <g transform="translate(300, 320)">
    <circle cx="0" cy="0" r="150" fill="none" stroke="url(#w_gold)" stroke-width="1.5" opacity="0.4" />
    <circle cx="0" cy="0" r="135" fill="none" stroke="url(#w_gold)" stroke-width="0.8" stroke-dasharray="6 6" opacity="0.6" />
    <path d="M-150 0 Q-130 -40 -110 -30 Q-120 -10 -150 0" fill="url(#w_gold)" opacity="0.7" />
    <path d="M150 0 Q130 -40 110 -30 Q120 -10 150 0" fill="url(#w_gold)" opacity="0.7" />
    <path d="M0 -150 Q40 -130 30 -110 Q10 -120 0 -150" fill="url(#w_gold)" opacity="0.7" />
    <path d="M0 150 Q40 130 30 110 Q10 120 0 150" fill="url(#w_gold)" opacity="0.7" />
    <text x="0" y="-30" text-anchor="middle" fill="url(#w_gold)" font-family="serif" font-size="14" letter-spacing="6" opacity="0.8">WITH LOVE &amp; GRATITUDE</text>
    <text x="0" y="35" text-anchor="middle" fill="url(#w_gold)" font-family="serif" font-size="64" font-weight="300" font-style="italic">Together</text>
    <text x="0" y="75" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-size="13" letter-spacing="4" opacity="0.7">FOREVER &amp; ALWAYS</text>
  </g>
  
  <text x="300" y="580" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-size="24" letter-spacing="2">THANK YOU FOR CELEBRATING</text>
  <text x="300" y="615" text-anchor="middle" fill="url(#w_gold)" font-family="sans-serif" font-size="13" letter-spacing="4">LUXURY WEDDING &amp; RECEPTION FAVOR</text>
  <text x="300" y="655" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-style="italic" font-size="14" opacity="0.65">"Your presence made our special day unforgettable"</text>
  <line x1="220" y1="685" x2="380" y2="685" stroke="url(#w_gold)" stroke-width="1" opacity="0.5" />
</svg>`;

// 4. Gold Mandala Heritage SVG
const mandalaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="m_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A0B2E"/>
      <stop offset="50%" stop-color="#11051F"/>
      <stop offset="100%" stop-color="#08020E"/>
    </linearGradient>
    <linearGradient id="m_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEAA7"/>
      <stop offset="50%" stop-color="#DFB15B"/>
      <stop offset="100%" stop-color="#9E7422"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#m_bg)" />
  <rect x="30" y="30" width="540" height="540" rx="28" fill="none" stroke="url(#m_gold)" stroke-width="2" opacity="0.6" />
  <rect x="42" y="42" width="516" height="516" rx="20" fill="none" stroke="url(#m_gold)" stroke-width="1" stroke-dasharray="6 6" opacity="0.4" />
  
  <g transform="translate(300, 260)" stroke="url(#m_gold)" fill="none">
    <circle cx="0" cy="0" r="130" stroke-width="1.5" opacity="0.4" />
    <circle cx="0" cy="0" r="110" stroke-width="1" stroke-dasharray="4 4" opacity="0.6" />
    <circle cx="0" cy="0" r="80" stroke-width="1.5" />
    <circle cx="0" cy="0" r="50" stroke-width="1" />
    <circle cx="0" cy="0" r="20" fill="url(#m_gold)" opacity="0.8" />
    
    <g transform="rotate(0)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(45)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(90)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(135)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(180)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(225)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(270)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
    <g transform="rotate(315)"><path d="M0 -20 Q20 -50 0 -80 Q-20 -50 0 -20" stroke-width="1.5" fill="url(#m_gold)" fill-opacity="0.15"/><path d="M0 -80 Q35 -105 0 -130 Q-35 -105 0 -80" stroke-width="1.2" fill="url(#m_gold)" fill-opacity="0.2"/><circle cx="0" cy="-130" r="3" fill="url(#m_gold)"/></g>
  </g>
  
  <text x="300" y="450" text-anchor="middle" fill="url(#m_gold)" font-family="serif" font-size="24" letter-spacing="3" font-weight="bold">AUSPICIOUS HERITAGE</text>
  <text x="300" y="485" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="13" letter-spacing="4" opacity="0.9">FESTIVE &amp; CORPORATE RETURN GIFT</text>
  <text x="300" y="520" text-anchor="middle" fill="url(#m_gold)" font-family="serif" font-style="italic" font-size="13" opacity="0.75">"Wishing you prosperity, boundless joy and success"</text>
</svg>`;

fs.writeFileSync(path.join(outDir, 'return_gift_ganesha.svg'), ganeshaSvg);
fs.writeFileSync(path.join(outDir, 'return_gift_baby_teddy.svg'), teddySvg);
fs.writeFileSync(path.join(outDir, 'return_gift_wedding_favor.svg'), weddingSvg);
fs.writeFileSync(path.join(outDir, 'return_gift_gold_mandala.svg'), mandalaSvg);

console.log('Successfully written all 4 return gift SVGs!');
