// Catálogo de elementos do funil.
// Ícones: SVG inline (stroke), viewBox 24×24 — sem biblioteca externa (DESIGN.md).
// Cores derivadas exclusivamente do DESIGN.md:
//   tráfego  → accent rgb(242,86,43) | páginas → #DEDEDE
//   ações    → rgb(153,153,153)      | conteúdo → rgba(255,255,255,0.6)

export const CATEGORIES = [
  {
    id: 'traffic',
    label: 'Tráfego',
    tint: 'rgb(242, 86, 43)',
    items: [
      { type: 'meta-ads', label: 'Meta Ads' },
      { type: 'google-ads', label: 'Google Ads' },
      { type: 'youtube', label: 'YouTube' },
      { type: 'instagram', label: 'Instagram' },
      { type: 'tiktok', label: 'TikTok' },
      { type: 'email-traffic', label: 'E-mail' },
      { type: 'seo', label: 'Orgânico / SEO' },
      { type: 'referral', label: 'Indicação' },
    ],
  },
  {
    id: 'pages',
    label: 'Páginas',
    tint: '#DEDEDE',
    items: [
      { type: 'optin', label: 'Captura' },
      { type: 'sales-page', label: 'Página de Vendas' },
      { type: 'vsl', label: 'VSL' },
      { type: 'webinar', label: 'Webinar' },
      { type: 'quiz', label: 'Quiz' },
      { type: 'checkout', label: 'Checkout' },
      { type: 'upsell', label: 'Upsell' },
      { type: 'downsell', label: 'Downsell' },
      { type: 'thank-you', label: 'Obrigado' },
      { type: 'members', label: 'Área de Membros' },
      { type: 'calendar', label: 'Agendamento' },
      { type: 'blog', label: 'Artigo / Blog' },
    ],
  },
  {
    id: 'milestones',
    label: 'Marcos',
    tint: 'rgb(242, 86, 43)',
    items: [
      { type: 'lead', label: 'Lead' },
      { type: 'customer', label: 'Cliente' },
      { type: 'deal-lost', label: 'Venda Perdida' },
    ],
  },
  {
    id: 'actions',
    label: 'Ações',
    tint: 'rgb(153, 153, 153)',
    items: [
      { type: 'send-email', label: 'Enviar E-mail' },
      { type: 'sequence', label: 'Sequência' },
      { type: 'whatsapp', label: 'WhatsApp' },
      { type: 'sms', label: 'SMS' },
      { type: 'call', label: 'Ligação' },
      { type: 'wait', label: 'Espera' },
      { type: 'automation', label: 'Automação' },
      { type: 'tag', label: 'Tag / Segmento' },
    ],
  },
  {
    id: 'content',
    label: 'Conteúdo',
    tint: 'rgba(255, 255, 255, 0.6)',
    items: [
      { type: 'post', label: 'Post' },
      { type: 'reels', label: 'Reels / Vídeo' },
      { type: 'community', label: 'Comunidade' },
      { type: 'lead-magnet', label: 'Isca Digital' },
    ],
  },
]

// Ícones em markup SVG interno (stroke = currentColor)
export const ICONS = {
  'meta-ads':
    '<path d="m3 11 17-6v14L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  'google-ads':
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  youtube:
    '<rect x="2.5" y="6" width="19" height="13" rx="3.5"/><path d="m10 9.5 5 3-5 3v-6z" fill="currentColor" stroke="none"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none"/>',
  tiktok:
    '<path d="M14 4v10.5a4 4 0 1 1-3.2-3.92"/><path d="M14 4a5.2 5.2 0 0 0 5 5"/>',
  'email-traffic':
    '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
  seo: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  referral:
    '<circle cx="8.5" cy="8" r="3"/><path d="M2.5 19.5a6 6 0 0 1 12 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.6a5 5 0 0 1 5.5 4.9"/>',

  optin:
    '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 8.5h18"/><path d="M7 12.5h6"/><rect x="7" y="15" width="10" height="2.4" rx="1.2"/>',
  'sales-page':
    '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 8.5h18"/><path d="M12 10.8v7"/><path d="M14.4 12.2c-.5-.8-1.4-1.2-2.4-1.2-1.3 0-2.3.7-2.3 1.7 0 2.3 4.8 1.2 4.8 3.4 0 1-1 1.7-2.5 1.7-1.1 0-2-.4-2.5-1.2"/>',
  vsl: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 8.5h18"/><path d="m10.5 11.5 4.5 2.75-4.5 2.75v-5.5z" fill="currentColor" stroke="none"/>',
  webinar:
    '<rect x="3" y="4" width="18" height="13" rx="2.5"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="m10.5 8 4 2.5-4 2.5V8z" fill="currentColor" stroke="none"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5.1.7c0 1.7-2.6 2.2-2.6 3.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/>',
  checkout:
    '<circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h3l2.6 12h10.6l2.3-8.5H6.2"/>',
  upsell:
    '<path d="m3 17 6-6 4 4 8-8"/><path d="M15.5 7H21v5.5"/>',
  downsell:
    '<path d="m3 7 6 6 4-4 8 8"/><path d="M15.5 17H21v-5.5"/>',
  'thank-you':
    '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9"/>',
  members:
    '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.2" r="1.4" fill="currentColor" stroke="none"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M8 2.8V6M16 2.8V6"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/>',
  blog: '<path d="M6 2.8h9L20 8v11.5a1.8 1.8 0 0 1-1.8 1.7H6a1.8 1.8 0 0 1-1.8-1.7V4.5A1.8 1.8 0 0 1 6 2.8z"/><path d="M14.5 3v5h5"/><path d="M8.5 12.5h7M8.5 16h7"/>',

  lead: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20.5a7 7 0 0 1 14 0"/>',
  customer:
    '<path d="M12 2.8v18.4"/><path d="M16.5 6.5c-.8-1.1-2.4-1.7-4.5-1.7-2.7 0-4.5 1.2-4.5 3.1 0 4.2 9 2.2 9 6.4 0 1.9-1.8 3.1-4.5 3.1-2.1 0-3.7-.6-4.5-1.7"/>',
  'deal-lost': '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',

  'send-email':
    '<path d="M21.5 2.5 11 13"/><path d="M21.5 2.5 14.8 21.3l-3.8-8.3-8.3-3.8L21.5 2.5z"/>',
  sequence:
    '<path d="m12 2.7 9 4.5-9 4.5-9-4.5 9-4.5z"/><path d="m3 12 9 4.5L21 12"/><path d="m3 16.5 9 4.5 9-4.5"/>',
  whatsapp:
    '<path d="M21 11.7a8.8 8.8 0 0 1-12.7 7.9L3 21l1.5-5.1A8.8 8.8 0 1 1 21 11.7z"/><path d="M8.8 9.5c.5 2.5 3.2 5.2 5.7 5.7l1.2-1.5 2 1"/>',
  sms: '<path d="M21 15.5a2 2 0 0 1-2 2H8l-4.5 4v-15a2 2 0 0 1 2-2H19a2 2 0 0 1 2 2v9z"/><path d="M8.5 9.5h7M8.5 13h4.5"/>',
  call: '<path d="M21 16.7v2.8a1.8 1.8 0 0 1-2 1.8A17.8 17.8 0 0 1 2.7 5a1.8 1.8 0 0 1 1.8-2h2.8a1.8 1.8 0 0 1 1.8 1.5c.12.9.34 1.8.65 2.6a1.8 1.8 0 0 1-.4 1.9L8.1 10.2a14.5 14.5 0 0 0 5.7 5.7l1.2-1.2a1.8 1.8 0 0 1 1.9-.4c.84.3 1.7.53 2.6.65A1.8 1.8 0 0 1 21 16.7z"/>',
  wait: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5V12l3.5 2.2"/>',
  automation:
    '<path d="M13 2.5 4 14h7l-1 7.5L19 10h-7l1-7.5z"/>',
  tag: '<path d="m3 12.5 8.5 8.5a2 2 0 0 0 2.8 0l6.7-6.7a2 2 0 0 0 0-2.8L12.5 3H5a2 2 0 0 0-2 2v7.5z"/><circle cx="8.3" cy="8.3" r="1.2" fill="currentColor" stroke="none"/>',

  post: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><circle cx="9" cy="9" r="1.8"/><path d="m4 17 5-5 3.5 3.5L16 12l4.5 4.5"/>',
  reels:
    '<rect x="3" y="3.5" width="18" height="17" rx="3"/><path d="M3 8.5h18M8.5 3.5l2.5 5M14 3.5l2.5 5"/><path d="m10.5 12.5 4 2.5-4 2.5v-5z" fill="currentColor" stroke="none"/>',
  community:
    '<circle cx="9" cy="8.5" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16.5 5.7a3 3 0 0 1 0 5.6"/><path d="M17.5 14.2A6 6 0 0 1 21 20"/>',
  'lead-magnet':
    '<path d="M12 3v11"/><path d="m7.5 10 4.5 4.5L16.5 10"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',

  note: '<path d="M5 3.5h14A1.5 1.5 0 0 1 20.5 5v9.5L14.5 20.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z"/><path d="M14.5 20.5V15a.5.5 0 0 1 .5-.5h5.5"/>',
  text: '<path d="M5 7V4.5h14V7"/><path d="M12 4.5V19.5"/><path d="M8.5 19.5h7"/>',
}

// Wireframes das páginas (corpo da mini-janela de navegador, viewBox 0 0 64 60).
// Classes: wf-line (fill borda) · wf-strong (fill secundário) · wf-accent (fill accent)
//          wf-stroke (contorno) · wf-check (contorno accent)
export const PAGE_WIREFRAMES = {
  optin:
    '<rect class="wf-strong" x="12" y="8" width="40" height="5" rx="2"/><rect class="wf-line" x="16" y="17" width="32" height="3" rx="1.5"/><rect class="wf-line" x="20" y="23" width="24" height="3" rx="1.5"/><rect class="wf-stroke" x="14" y="31" width="36" height="8" rx="2"/><rect class="wf-accent" x="14" y="44" width="36" height="9" rx="4.5"/>',
  'sales-page':
    '<rect class="wf-strong" x="10" y="8" width="44" height="5" rx="2"/><rect class="wf-line" x="10" y="17" width="44" height="3" rx="1.5"/><rect class="wf-line" x="10" y="22" width="44" height="3" rx="1.5"/><rect class="wf-line" x="10" y="27" width="36" height="3" rx="1.5"/><rect class="wf-line" x="10" y="32" width="44" height="3" rx="1.5"/><rect class="wf-accent" x="16" y="42" width="32" height="9" rx="4.5"/>',
  vsl: '<rect class="wf-stroke" x="10" y="6" width="44" height="26" rx="2"/><path class="wf-accent" d="m28 13 12 6-12 6z"/><rect class="wf-line" x="14" y="36" width="36" height="3" rx="1.5"/><rect class="wf-line" x="18" y="41" width="28" height="3" rx="1.5"/><rect class="wf-accent" x="16" y="48" width="32" height="8" rx="4"/>',
  webinar:
    '<rect class="wf-stroke" x="10" y="6" width="44" height="24" rx="2"/><path class="wf-accent" d="m29 12 9 6-9 6z"/><circle class="wf-line" cx="14" cy="37" r="2.5"/><rect class="wf-line" x="19" y="35" width="30" height="3" rx="1.5"/><circle class="wf-line" cx="14" cy="45" r="2.5"/><rect class="wf-line" x="19" y="43" width="30" height="3" rx="1.5"/><circle class="wf-line" cx="14" cy="53" r="2.5"/><rect class="wf-line" x="19" y="51" width="30" height="3" rx="1.5"/>',
  quiz: '<rect class="wf-strong" x="12" y="7" width="40" height="5" rx="2"/><circle class="wf-stroke" cx="14" cy="19" r="2.5"/><rect class="wf-line" x="20" y="17" width="28" height="3" rx="1.5"/><circle class="wf-stroke" cx="14" cy="27" r="2.5"/><rect class="wf-line" x="20" y="25" width="28" height="3" rx="1.5"/><circle class="wf-stroke" cx="14" cy="35" r="2.5"/><rect class="wf-line" x="20" y="33" width="28" height="3" rx="1.5"/><rect class="wf-accent" x="14" y="44" width="36" height="9" rx="4.5"/>',
  checkout:
    '<rect class="wf-strong" x="10" y="7" width="26" height="4" rx="2"/><rect class="wf-stroke" x="10" y="14" width="44" height="7" rx="2"/><rect class="wf-stroke" x="10" y="24" width="44" height="7" rx="2"/><rect class="wf-stroke" x="10" y="34" width="26" height="7" rx="2"/><rect class="wf-accent" x="10" y="46" width="44" height="9" rx="4.5"/>',
  upsell:
    '<rect class="wf-strong" x="12" y="7" width="40" height="5" rx="2"/><rect class="wf-stroke" x="14" y="16" width="36" height="18" rx="2"/><path class="wf-accent" d="m29 21 8 4-8 4z"/><rect class="wf-accent" x="14" y="39" width="36" height="8" rx="4"/><rect class="wf-line" x="20" y="51" width="24" height="3" rx="1.5"/>',
  downsell:
    '<rect class="wf-strong" x="12" y="7" width="40" height="5" rx="2"/><rect class="wf-stroke" x="14" y="16" width="36" height="18" rx="2"/><path class="wf-check" d="m26 22 6 6 6-6"/><rect class="wf-accent" x="14" y="39" width="36" height="8" rx="4"/><rect class="wf-line" x="20" y="51" width="24" height="3" rx="1.5"/>',
  'thank-you':
    '<circle class="wf-stroke" cx="32" cy="21" r="11"/><path class="wf-check" d="m27 21 4 4 7-7"/><rect class="wf-line" x="16" y="40" width="32" height="3" rx="1.5"/><rect class="wf-line" x="20" y="46" width="24" height="3" rx="1.5"/>',
  members:
    '<rect class="wf-strong" x="10" y="7" width="20" height="4" rx="2"/><rect class="wf-stroke" x="10" y="15" width="20" height="16" rx="2"/><rect class="wf-stroke" x="34" y="15" width="20" height="16" rx="2"/><rect class="wf-stroke" x="10" y="35" width="20" height="16" rx="2"/><rect class="wf-stroke" x="34" y="35" width="20" height="16" rx="2"/><path class="wf-accent" d="m17 19 7 4-7 4z"/>',
  calendar:
    '<rect class="wf-stroke" x="10" y="8" width="44" height="44" rx="3"/><rect class="wf-strong" x="10" y="8" width="44" height="9" rx="3"/><rect class="wf-line" x="16" y="23" width="7" height="6" rx="1"/><rect class="wf-line" x="28" y="23" width="7" height="6" rx="1"/><rect class="wf-line" x="40" y="23" width="7" height="6" rx="1"/><rect class="wf-line" x="16" y="33" width="7" height="6" rx="1"/><rect class="wf-accent" x="28" y="33" width="7" height="6" rx="1"/><rect class="wf-line" x="40" y="33" width="7" height="6" rx="1"/><rect class="wf-line" x="16" y="43" width="7" height="6" rx="1"/>',
  blog: '<rect class="wf-stroke" x="10" y="7" width="44" height="20" rx="2"/><path class="wf-stroke" d="m14 23 8-7 7 6 8-8 13 11"/><rect class="wf-line" x="10" y="32" width="44" height="3" rx="1.5"/><rect class="wf-line" x="10" y="38" width="44" height="3" rx="1.5"/><rect class="wf-line" x="10" y="44" width="30" height="3" rx="1.5"/>',
  default:
    '<rect class="wf-strong" x="12" y="8" width="40" height="5" rx="2"/><rect class="wf-line" x="10" y="18" width="44" height="3" rx="1.5"/><rect class="wf-line" x="10" y="24" width="44" height="3" rx="1.5"/><rect class="wf-line" x="10" y="30" width="32" height="3" rx="1.5"/><rect class="wf-accent" x="16" y="42" width="32" height="9" rx="4.5"/>',
}

export function findElement(type) {
  for (const cat of CATEGORIES) {
    const item = cat.items.find((i) => i.type === type)
    if (item) return { ...item, tint: cat.tint, category: cat.id }
  }
  return null
}
