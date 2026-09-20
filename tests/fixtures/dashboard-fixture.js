// Dataset sintetico per analytics-dashboard.spec.js + valori attesi calcolati
// A MANO (non riscrivendo le formule di analytics.html) — così un bug identico
// in entrambi i posti non passerebbe inosservato. Ogni numero atteso riporta
// il calcolo nel commento.

function seedDashboardFixture(store) {
  store.sessions.push(
    { id: 's1', created_at: '2026-09-19T09:00:00Z', browser: 'Chrome', os: 'Android', is_mobile: true, screen_w: 412, screen_h: 915, language: 'it', total_ms: 42000, device_model: 'Pixel 8 Pro', isp: 'Vodafone Italia' },
    { id: 's2', created_at: '2026-09-19T09:05:00Z', browser: 'Chrome', os: 'Android', is_mobile: true, screen_w: 412, screen_h: 915, language: 'it', total_ms: 0 },
    { id: 's3', created_at: '2026-09-19T09:10:00Z', browser: 'Firefox', os: 'macOS', is_mobile: false, screen_w: 1680, screen_h: 1050, language: 'en', total_ms: 18000 },
    { id: 's4', created_at: '2026-09-19T09:15:00Z', browser: 'Chrome', os: 'iOS', is_mobile: true, screen_w: 390, screen_h: 844, language: 'it', total_ms: 0 },
    { id: 's5', created_at: '2026-09-19T09:20:00Z', browser: 'Safari', os: 'iOS', is_mobile: true, screen_w: 390, screen_h: 844, language: 'it', total_ms: 30000 },
  );

  store.image_views.push(
    { session_id: 's1', image_index: 0, image_label: 'Snowden', dwell_ms: 3000, enter_hour: 10, touch_side: 'left', touch_x_avg: 0.10, revisit_count: 0 },
    { session_id: 's1', image_index: 1, image_label: 'prodotto', dwell_ms: 2000, enter_hour: 10, touch_side: 'center', touch_x_avg: 0.50, revisit_count: 0 },
    { session_id: 's2', image_index: 0, image_label: 'Snowden', dwell_ms: 1000, enter_hour: 11, touch_side: 'left', touch_x_avg: 0.15, revisit_count: 1 },
    { session_id: 's2', image_index: 2, image_label: 'petrolio', dwell_ms: 2500, enter_hour: 11, touch_side: 'right', touch_x_avg: 0.90, revisit_count: 0 },
    { session_id: 's3', image_index: 7, image_label: 'privacy', dwell_ms: 4000, enter_hour: 20, touch_side: 'right', touch_x_avg: 0.80, revisit_count: 0 },
    { session_id: 's3', image_index: 7, image_label: 'privacy', dwell_ms: 2000, enter_hour: 20, touch_side: 'right', touch_x_avg: 0.85, revisit_count: 1 },
    { session_id: 's4', image_index: 3, image_label: 'zuboff', dwell_ms: 1500, enter_hour: 9, touch_side: 'center', touch_x_avg: 0.55, revisit_count: 0 },
    { session_id: 's4', image_index: 4, image_label: 'internet', dwell_ms: 1000, enter_hour: 9, touch_side: 'right', touch_x_avg: 0.75, revisit_count: 0 },
    { session_id: 's5', image_index: 5, image_label: 'tecnologia', dwell_ms: 2000, enter_hour: 21, touch_side: 'center', touch_x_avg: 0.40, revisit_count: 0 },
    { session_id: 's5', image_index: 6, image_label: 'papa-francesco', dwell_ms: 1000, enter_hour: 21, touch_side: 'right', touch_x_avg: 0.99, revisit_count: 0 },
  );

  store.hearts.push(
    { session_id: 's1', image_index: 0, image_label: 'Snowden', touch_x_pct: 0.90, hour_of_day: 10 },
    { session_id: 's1', image_index: 0, image_label: 'Snowden', touch_x_pct: 0.90, hour_of_day: 10 },
    { session_id: 's2', image_index: 7, image_label: 'privacy', touch_x_pct: 0.20, hour_of_day: 20 },
    { session_id: 's3', image_index: 7, image_label: 'privacy', touch_x_pct: 0.50, hour_of_day: 20 },
    { session_id: 's3', image_index: 7, image_label: 'privacy', touch_x_pct: 0.50, hour_of_day: 20 },
    { session_id: 's4', image_index: 1, image_label: 'prodotto', touch_x_pct: 0.99, hour_of_day: 9 },
    { session_id: 's5', image_index: 1, image_label: 'prodotto', touch_x_pct: 0.99, hour_of_day: 21 },
  );

  store.scroll_events.push(
    { session_id: 's1', from_index: 0, to_index: 1, direction: 'next', velocity: 0.10, duration_ms: 300, touch_x_pct: 0.20 },
    { session_id: 's1', from_index: 1, to_index: 2, direction: 'next', velocity: 0.20, duration_ms: 300, touch_x_pct: 0.50 },
    { session_id: 's2', from_index: 0, to_index: 1, direction: 'next', velocity: 0.60, duration_ms: 150, touch_x_pct: 0.80 },
    { session_id: 's2', from_index: 2, to_index: 1, direction: 'prev', velocity: 0.70, duration_ms: 150, touch_x_pct: 0.90 },
    { session_id: 's3', from_index: 5, to_index: 6, direction: 'next', velocity: 0.05, duration_ms: 900, touch_x_pct: 0.30 },
    { session_id: 's3', from_index: 6, to_index: 5, direction: 'prev', velocity: 0.90, duration_ms: 150, touch_x_pct: 0.10 },
    { session_id: 's4', from_index: 3, to_index: 4, direction: 'next', velocity: 0.30, duration_ms: 300, touch_x_pct: 0.50 },
    { session_id: 's5', from_index: 6, to_index: 5, direction: 'prev', velocity: 0.15, duration_ms: 300, touch_x_pct: 0.70 },
  );
}

const expected = {
  // sessions: 5 righe totali; mobile = s1,s2,s4,s5 (is_mobile:true) = 4
  totalSessions: 5,
  mobileCount: 4,

  // hearts: 7 righe totali; media = 7 / 5 sessioni = 1.4
  totalHearts: 7,
  heartsPerUser: '1.4',

  // image_views: 10 righe; somma dwell_ms = 3000+2000+1000+2500+4000+2000+1500+1000+2000+1000 = 20000
  // media = 20000 / 10 = 2000ms -> fmtMs = "2.0s"
  totalViews: 10,
  avgDwellFmt: '2.0s',

  // scroll_events: 8 righe; veloci (|velocity|>0.5): 0.6, 0.7, 0.9 = 3
  totalScrolls: 8,
  fastScrolls: 3,

  // avgSession: media di total_ms>0 tra {42000 (s1), 18000 (s3), 30000 (s5)} = 90000/3 = 30000ms -> "30.0s"
  avgSessionFmt: '30.0s',

  // revisit_count>0 su 2 righe di image_views (s2/slide0, s3/slide7 seconda visita)
  revisits: 2,

  // direzioni scroll: next = 5 (s1x2, s2, s3, s4), prev = 3 (s2, s3, s5)
  nextScrolls: 5,
  prevScrolls: 3,
  // media velocità = (0.10+0.20+0.60+0.70+0.05+0.90+0.30+0.15)/8 = 3.00/8 = 0.375
  avgVelocity: '0.375',

  // rilevamento mano — solo image_views + scroll_events (i cuori sono esclusi:
  // il bottone è fisso in basso a destra, quindi sbilancerebbe sempre verso
  // "destra" indipendentemente da quale mano regga il telefono):
  //  image_views.touch_side diretto:      left=2 (s1/slide0,s2/slide0)  right=5  center=3
  //  scroll_events.touch_x_pct a soglie:  left=3 (0.20,0.30,0.10)       right=3 (0.80,0.90,0.70) center=2 (0.50,0.50)
  // totali: left=2+3=5  right=5+3=8  center=3+2=5  -> totale 18
  handsTotal: 18,
  handsLeftPct: 28, // round(5/18*100) = round(27.78) = 28
  handsRightPct: 44, // round(8/18*100) = round(44.44) = 44
  handsCenterPct: 28, // round(5/18*100) = 28

  // attività per ora: V.enter_hour {10,10,11,11,20,20,9,9,21,21} + H.hour_of_day {10,10,20,20,20,9,21}
  // hour9=3 hour10=4 hour11=2 hour20=5 hour21=3
  byHourPeaks: { 9: 3, 10: 4, 11: 2, 20: 5, 21: 3 },

  // browser: Chrome (s1,s2,s4)=3, Firefox (s3)=1, Safari (s5)=1 — ordine per frequenza
  // decrescente. analytics.html interroga sessions con .order('created_at','desc'),
  // quindi l'array S arriva già invertito (s5,s4,s3,s2,s1): a parità di conteggio
  // (Firefox=1, Safari=1) lo stable sort preserva l'ordine di PRIMA APPARIZIONE in
  // questo array invertito, dove Safari (s5) precede Firefox (s3).
  browserOrder: [['Chrome', 3], ['Safari', 1], ['Firefox', 1]],
  // os, stesso ragionamento su S invertito (s5,s4,s3,s2,s1): iOS appare per primo
  // (s5), poi macOS (s3), poi Android (s2) — Android e iOS pareggiano a 2, iOS
  // preservato prima per ordine di prima apparizione nell'array invertito.
  osOrder: [['iOS', 2], ['Android', 2], ['macOS', 1]],

  // per-slide (image_index): usato per heatmap e bar chart dwell/cuori
  perSlide: {
    0: { avgDwellMs: 2000, hearts: 2 }, // (3000+1000)/2
    1: { avgDwellMs: 2000, hearts: 2 }, // solo s1 (2000ms); cuori s4+s5
    2: { avgDwellMs: 2500, hearts: 0 },
    3: { avgDwellMs: 1500, hearts: 0 },
    4: { avgDwellMs: 1000, hearts: 0 },
    5: { avgDwellMs: 2000, hearts: 0 },
    6: { avgDwellMs: 1000, hearts: 0 },
    7: { avgDwellMs: 3000, hearts: 3 }, // (4000+2000)/2 dwell; 3 cuori (s2,s3,s3)
  },

  // per-sessione (tabella "Sessioni recenti"): 2 view + N cuori ciascuna
  perSession: {
    s1: { views: 2, hearts: 2 },
    s2: { views: 2, hearts: 1 },
    s3: { views: 2, hearts: 2 },
    s4: { views: 2, hearts: 1 },
    s5: { views: 2, hearts: 1 },
  },
};

module.exports = { seedDashboardFixture, expected };
