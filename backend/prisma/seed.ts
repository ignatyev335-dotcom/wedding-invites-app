import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed the database with initial data:
 * - 12 envelope templates
 * - 12 design templates
 * - Basic dress codes
 * - Sample music tracks
 * - Sample illustrations
 */
async function main() {
  console.log('[Seed] Starting database seed...');

  // ─── Envelope Templates ───
  const envelopes = [
    {
      name: 'Классический белый',
      style: 'classic',
      image: '/assets/envelopes/classic-white.png',
      sealImage: '/assets/seals/heart-gold.png',
      isPremium: false,
      isLight: false,
    },
    {
      name: 'Крафтовый конверт',
      style: 'craft',
      image: '/assets/envelopes/kraft.png',
      sealImage: '/assets/seals/flower-brown.png',
      isPremium: false,
      isLight: false,
    },
    {
      name: 'Элегантный золотой',
      style: 'elegant',
      image: '/assets/envelopes/gold-elegant.png',
      sealImage: '/assets/seals/crown-gold.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Рустикальное кружево',
      style: 'rustic',
      image: '/assets/envelopes/rustic-lace.png',
      sealImage: '/assets/seals/wreath-green.png',
      isPremium: false,
      isLight: false,
    },
    {
      name: 'Минимализм черный',
      style: 'minimal',
      image: '/assets/envelopes/minimal-black.png',
      sealImage: '/assets/seals/geometric-black.png',
      isPremium: false,
      isLight: true,
    },
    {
      name: 'Бохо винтаж',
      style: 'boho',
      image: '/assets/envelopes/boho-vintage.png',
      sealImage: '/assets/seals/feather-rose.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Морская тематика',
      style: 'nautical',
      image: '/assets/envelopes/nautical.png',
      sealImage: '/assets/seals/shell-blue.png',
      isPremium: false,
      isLight: true,
    },
    {
      name: 'Зимняя сказка',
      style: 'winter',
      image: '/assets/envelopes/winter-tale.png',
      sealImage: '/assets/seals/snowflake-silver.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Сад цветов',
      style: 'floral',
      image: '/assets/envelopes/garden-flowers.png',
      sealImage: '/assets/seals/rose-gold.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Винтаж париж',
      style: 'paris',
      image: '/assets/envelopes/paris-vintage.png',
      sealImage: '/assets/seals/eiffel-gold.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Современный акварель',
      style: 'watercolor',
      image: '/assets/envelopes/watercolor.png',
      sealImage: '/assets/seals/splash-pink.png',
      isPremium: false,
      isLight: true,
    },
    {
      name: 'Королевский синий',
      style: 'royal',
      image: '/assets/envelopes/royal-blue.png',
      sealImage: '/assets/seals/coat-blue.png',
      isPremium: true,
      isLight: false,
    },
  ];

  for (const envelope of envelopes) {
    await prisma.envelope.upsert({
      where: { id: envelopes.indexOf(envelope) + 1 },
      update: {},
      create: envelope,
    });
  }
  console.log(`[Seed] Created ${envelopes.length} envelope templates`);

  // ─── Design Templates ───
  const templates = [
    {
      name: 'Классическая элегантность',
      style: 'classic',
      css: `
        .invite-card { background: #fff; font-family: 'Playfair Display', serif; }
        .header { color: #1a1a1a; text-align: center; }
        .names { font-size: 2.5em; color: #8b7355; }
        .details { color: #666; line-height: 1.8; }
        .accent { color: #c9a96e; }
      `,
      thumbnail: '/assets/templates/classic-elegant.png',
      isPremium: false,
      isLight: false,
    },
    {
      name: 'Современный минимализм',
      style: 'minimal',
      css: `
        .invite-card { background: #fafafa; font-family: 'Helvetica Neue', sans-serif; }
        .header { color: #222; letter-spacing: 0.15em; text-transform: uppercase; }
        .names { font-size: 2em; font-weight: 300; }
        .details { color: #888; font-size: 0.95em; }
        .accent { border-bottom: 1px solid #222; }
      `,
      thumbnail: '/assets/templates/minimal-modern.png',
      isPremium: false,
      isLight: false,
    },
    {
      name: 'Рустикальный шик',
      style: 'rustic',
      css: `
        .invite-card { background: #f5f0e8; font-family: 'Georgia', serif; }
        .header { color: #5c4a32; }
        .names { font-size: 2.2em; color: #8b6914; }
        .details { color: #6b5d4f; }
        .accent { color: #a0826d; }
        .divider { border-top: 2px dashed #c4b49a; }
      `,
      thumbnail: '/assets/templates/rustic-chic.png',
      isPremium: false,
      isLight: false,
    },
    {
      name: 'Цветочная мечта',
      style: 'floral',
      css: `
        .invite-card { background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%); font-family: 'Cormorant Garamond', serif; }
        .header { color: #8b4557; }
        .names { font-size: 2.4em; color: #c97b8b; }
        .details { color: #7a6b6b; }
        .accent { color: #e8a5b4; }
        .floral-border { border: 3px double #e8c4cc; }
      `,
      thumbnail: '/assets/templates/floral-dream.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Ар-деко роскошь',
      style: 'artdeco',
      css: `
        .invite-card { background: #0f0f0f; font-family: 'Cinzel', serif; }
        .header { color: #f0e6d3; }
        .names { font-size: 2.3em; color: #d4af37; }
        .details { color: #b8a88a; }
        .accent { color: #d4af37; border: 1px solid #d4af37; }
        .gold-line { background: linear-gradient(90deg, transparent, #d4af37, transparent); height: 1px; }
      `,
      thumbnail: '/assets/templates/artdeco-luxury.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Морской бриз',
      style: 'nautical',
      css: `
        .invite-card { background: #e8f4f8; font-family: 'Lato', sans-serif; }
        .header { color: #2c5f7c; }
        .names { font-size: 2.1em; color: #1a4a6e; }
        .details { color: #4a7a94; }
        .accent { color: #87ceeb; }
        .wave-border { border-bottom: 3px wavy #87ceeb; }
      `,
      thumbnail: '/assets/templates/nautical-breeze.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Бохо свобода',
      style: 'boho',
      css: `
        .invite-card { background: #fdf8f3; font-family: 'Amatic SC', cursive; }
        .header { color: #6b4423; }
        .names { font-size: 3em; color: #a0714f; }
        .details { color: #8b7355; font-size: 1.1em; }
        .accent { color: #d4a574; }
        .feather { opacity: 0.6; }
      `,
      thumbnail: '/assets/templates/boho-freedom.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Винтаж Париж',
      style: 'paris',
      css: `
        .invite-card { background: #f8f5f0; font-family: 'Parisienne', cursive; }
        .header { color: #4a4a4a; }
        .names { font-size: 2.6em; color: #b8860b; }
        .details { color: #777; }
        .accent { color: #d4af37; }
        .lace { background-image: url('/assets/lace-border.png'); }
      `,
      thumbnail: '/assets/templates/paris-vintage.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Зимняя сказка',
      style: 'winter',
      css: `
        .invite-card { background: #f0f4f8; font-family: 'Quicksand', sans-serif; }
        .header { color: #4a6572; }
        .names { font-size: 2.2em; color: #90a4ae; }
        .details { color: #78909c; }
        .accent { color: #b0bec5; }
        .snow { text-shadow: 0 0 10px rgba(176, 190, 197, 0.5); }
      `,
      thumbnail: '/assets/templates/winter-tale.png',
      isPremium: false,
      isLight: true,
    },
    {
      name: 'Акварель нежность',
      style: 'watercolor',
      css: `
        .invite-card { background: #fff; font-family: 'Dancing Script', cursive; }
        .header { color: #7a6b7d; }
        .names { font-size: 2.5em; color: #b8a0c8; }
        .details { color: #9a8a9a; }
        .accent { color: #d4c4e0; }
        .splash { background: radial-gradient(circle at 50% 50%, rgba(212,196,224,0.2), transparent); }
      `,
      thumbnail: '/assets/templates/watercolor-tender.png',
      isPremium: false,
      isLight: true,
    },
    {
      name: 'Тропический рай',
      style: 'tropical',
      css: `
        .invite-card { background: #f0f8f0; font-family: 'Montserrat', sans-serif; }
        .header { color: #2e5c3e; }
        .names { font-size: 2.2em; color: #4a8c5c; }
        .details { color: #5a7a6a; }
        .accent { color: #6b9b7a; }
        .leaf { color: #4a8c5c; opacity: 0.7; }
      `,
      thumbnail: '/assets/templates/tropical-paradise.png',
      isPremium: true,
      isLight: false,
    },
    {
      name: 'Королевская классика',
      style: 'royal',
      css: `
        .invite-card { background: #0a1628; font-family: 'Trajan Pro', serif; }
        .header { color: #c9b037; }
        .names { font-size: 2.4em; color: #e8d48b; letter-spacing: 0.1em; }
        .details { color: #a09060; }
        .accent { color: #d4af37; border: 2px solid #d4af37; }
        .crown { font-size: 1.5em; }
      `,
      thumbnail: '/assets/templates/royal-classic.png',
      isPremium: true,
      isLight: false,
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: templates.indexOf(template) + 1 },
      update: {},
      create: template,
    });
  }
  console.log(`[Seed] Created ${templates.length} design templates`);

  // ─── Dress Codes ───
  const dressCodes = [
    {
      name: 'Классический стиль',
      description: 'Мужчины в костюмах, женщины в вечерних платьях.',
      colors: ['#000000', '#1a1a1a', '#2c2c2c', '#3d3d3d', '#8b7355'],
      image: '/assets/dresscodes/classic.png',
      isPremium: false,
    },
    {
      name: 'Пастельные тона',
      description: 'Нежные пастельные оттенки: розовый, голубой, персиковый.',
      colors: ['#ffd1dc', '#c5e3ec', '#ffdab9', '#e6e6fa', '#f0f8e6'],
      image: '/assets/dresscodes/pastel.png',
      isPremium: false,
    },
    {
      name: 'Морская тематика',
      description: 'Синие, голубые и белые тона в духе морской волны.',
      colors: ['#1a4a6e', '#4a8ab5', '#87ceeb', '#e8f4f8', '#ffffff'],
      image: '/assets/dresscodes/nautical.png',
      isPremium: false,
    },
    {
      name: 'Золото и шампань',
      description: 'Элегантные золотистые и кремовые оттенки.',
      colors: ['#d4af37', '#f5e6c8', '#c9b037', '#e8d48b', '#f0e8d0'],
      image: '/assets/dresscodes/gold-champagne.png',
      isPremium: true,
    },
    {
      name: 'Бордо и беж',
      description: 'Глубокий бордовый в сочетании с теплым бежевым.',
      colors: ['#800020', '#a52a2a', '#d2b48c', '#f5f5dc', '#8b4513'],
      image: '/assets/dresscodes/bordo-beige.png',
      isPremium: true,
    },
  ];

  for (const dressCode of dressCodes) {
    await prisma.dressCode.upsert({
      where: { id: dressCodes.indexOf(dressCode) + 1 },
      update: {},
      create: dressCode,
    });
  }
  console.log(`[Seed] Created ${dressCodes.length} dress codes`);

  // ─── Sample Music ───
  const musicTracks = [
    {
      name: 'Canon in D',
      artist: 'Johann Pachelbel',
      url: '/assets/music/canon-in-d.mp3',
      duration: 180,
      isPremium: false,
    },
    {
      name: 'A Thousand Years',
      artist: 'Christina Perri',
      url: '/assets/music/thousand-years.mp3',
      duration: 285,
      isPremium: false,
    },
    {
      name: 'Marry Me',
      artist: 'Train',
      url: '/assets/music/marry-me.mp3',
      duration: 217,
      isPremium: false,
    },
    {
      name: 'All of Me',
      artist: 'John Legend',
      url: '/assets/music/all-of-me.mp3',
      duration: 269,
      isPremium: true,
    },
    {
      name: 'Perfect',
      artist: 'Ed Sheeran',
      url: '/assets/music/perfect.mp3',
      duration: 263,
      isPremium: true,
    },
    {
      name: 'Thinking Out Loud',
      artist: 'Ed Sheeran',
      url: '/assets/music/thinking-out-loud.mp3',
      duration: 281,
      isPremium: false,
    },
    {
      name: 'At Last',
      artist: 'Etta James',
      url: '/assets/music/at-last.mp3',
      duration: 178,
      isPremium: true,
    },
    {
      name: 'Cant Help Falling in Love',
      artist: 'Elvis Presley',
      url: '/assets/music/cant-help-falling.mp3',
      duration: 182,
      isPremium: false,
    },
  ];

  for (const track of musicTracks) {
    await prisma.music.upsert({
      where: { id: musicTracks.indexOf(track) + 1 },
      update: {},
      create: track,
    });
  }
  console.log(`[Seed] Created ${musicTracks.length} music tracks`);

  // ─── Sample Illustrations ───
  const illustrations = [
    { url: '/assets/illustrations/rings.png', category: 'rings', tags: ['rings', 'gold', 'classic'] },
    { url: '/assets/illustrations/bouquet-roses.png', category: 'bouquet', tags: ['flowers', 'roses', 'romantic'] },
    { url: '/assets/illustrations/doves.png', category: 'doves', tags: ['doves', 'love', 'peace'] },
    { url: '/assets/illustrations/arch-floral.png', category: 'arch', tags: ['arch', 'flowers', 'ceremony'] },
    { url: '/assets/illustrations/couple-silhouette.png', category: 'couple', tags: ['couple', 'silhouette', 'romantic'] },
    { url: '/assets/illustrations/champagne.png', category: 'champagne', tags: ['champagne', 'celebration', 'toast'] },
    { url: '/assets/illustrations/cake-elegant.png', category: 'cake', tags: ['cake', 'elegant', 'tiers'] },
    { url: '/assets/illustrations/heart-watercolor.png', category: 'hearts', tags: ['heart', 'watercolor', 'art'] },
    { url: '/assets/illustrations/calendar.png', category: 'calendar', tags: ['calendar', 'date', 'save-the-date'] },
    { url: '/assets/illustrations/location-pin.png', category: 'location', tags: ['location', 'map', 'venue'] },
    { url: '/assets/illustrations/music-notes.png', category: 'music', tags: ['music', 'notes', 'melody'] },
    { url: '/assets/illustrations/car-wedding.png', category: 'car', tags: ['car', 'transport', 'vintage'] },
  ];

  for (const illustration of illustrations) {
    await prisma.illustration.upsert({
      where: { id: illustrations.indexOf(illustration) + 1 },
      update: {},
      create: illustration,
    });
  }
  console.log(`[Seed] Created ${illustrations.length} illustrations`);

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('[Seed] Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
