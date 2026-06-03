/**
 * MelaninGold Organic — products.js
 * Product data store. All pages read from this module.
 * Architecture: flat JS object on window.MG namespace.
 * Future: swap MG.Products.getAll() → API call (Firebase / Supabase / Sheets)
 * without changing any page rendering code.
 */

window.MG = window.MG || {};

MG.Products = (function () {

  /* ── Storage key ── */
  const KEY = 'mg_products_v2';

  /* ── Seed data ── */
  const SEED = [
    {
      id: 1,
      slug: 'seaweed-body-butter',
      name: 'Seaweed Body Butter',
      category: 'skin',
      price: 45000,
      image: '../assets/images/products/seaweed-body-butter.webp',
      shortDescription: 'Intensely hydrating whipped butter enriched with organic seaweed minerals.',
      fullDescription: 'An intensely moisturising body butter infused with pure seaweed extract harvested from the pristine waters of Zanzibar. Rich in natural minerals and antioxidants, it absorbs deeply to leave skin silky soft, supple, and glowing with healthy radiance. Ideal for dry or sensitive skin. Apply after bathing on slightly damp skin for maximum absorption.',
      tags: ['Organic', '200ml', 'Vegan-Collagen'],
      featured: true
    },
    {
      id: 2,
      slug: 'seaweed-body-scrub',
      name: 'Seaweed Body Scrub',
      category: 'body',
      price: 55000,
      image: '../assets/images/products/seaweed-body-scrub.webp',
      shortDescription: 'Exfoliating ocean-powered scrub that reveals luminous, smooth skin.',
      fullDescription: 'A rejuvenating body scrub that buffs away dead skin cells and reveals smooth, luminous skin beneath. Packed with natural minerals from organic seaweed to deeply nourish as it polishes. The gentle exfoliant texture is derived from natural sea minerals — no plastic microbeads. Use 2–3 times per week on damp skin for best results.',
      tags: ['Exfoliating', '500ml', 'All Skin Types'],
      featured: true
    },
    {
      id: 3,
      slug: 'seaweed-hair-food',
      name: 'Seaweed Hair Food',
      category: 'hair',
      price: 50000,
      image: '../assets/images/products/seaweed-hair-food.webp',
      shortDescription: 'Deep-penetrating hair food packed with ocean minerals and botanical oils.',
      fullDescription: 'A rich, nourishing hair food made with organic seaweed and carefully selected botanical extracts. Penetrates deep into the hair shaft to restore moisture, reduce breakage, and leave hair soft, manageable, and brilliantly alive. Suitable for all hair types including natural, relaxed, locs, and colour-treated hair.',
      tags: ['Hair', '500ml', 'Deep Conditioning'],
      featured: false
    },
    {
      id: 4,
      slug: 'seaweed-beard-oil',
      name: 'Seaweed Hair / Beard Oil',
      category: 'hair',
      price: 60000,
      image: '../assets/images/products/seaweed-beard-oil.webp',
      shortDescription: 'Growth-stimulating beard and hair oil crafted with organic seaweed.',
      fullDescription: 'A powerful blend for men combining organic seaweed and natural growth-stimulating botanical oils. Conditions the beard deeply, reduces itchiness and flakiness, and promotes healthy hair growth from root to tip. The lightweight formula absorbs without greasiness, leaving your beard and hair looking groomed and nourished.',
      tags: ['Men', '100ml', 'Hair Growth'],
      featured: true
    },
    {
      id: 5,
      slug: 'seaweed-conditioner',
      name: 'Seaweed Conditioner',
      category: 'hair',
      price: 50000,
      image: '../assets/images/products/seaweed-conditioner.webp',
      shortDescription: 'Deeply hydrating conditioner that smooths, strengthens, and revives.',
      fullDescription: 'A deeply hydrating conditioner powered by nutrient-rich seaweed. Restores moisture balance, tames frizz, and leaves every strand smooth, strong, and brilliantly manageable. Suitable for all hair types including colour-treated hair. Apply after shampooing, leave for 3–5 minutes, and rinse thoroughly.',
      tags: ['Hair', '500ml', 'All Hair Types'],
      featured: false
    },
    {
      id: 6,
      slug: 'seaweed-face-mask',
      name: 'Seaweed Face Mask',
      category: 'skin',
      price: 65000,
      image: '../assets/images/products/seaweed-face-mask.webp',
      shortDescription: 'Purifying seaweed face mask for visibly clearer, tighter, radiant skin.',
      fullDescription: 'A purifying face mask made with potent seaweed extracts that draw out impurities, tighten pores, and leave skin visibly clearer and more radiant. Rich in iodine, vitamins, and antioxidants, this mask delivers a spa-quality facial experience at home. Apply a generous layer to clean skin, leave for 15–20 minutes, then rinse with warm water.',
      tags: ['Face', '500ml', 'Purifying'],
      featured: false
    },
    {
      id: 7,
      slug: 'lemongrass-massage-oil',
      name: 'Lemongrass Massage Oil',
      category: 'body',
      price: 30000,
      image: '../assets/images/products/lemongrass-massage-oil.webp',
      shortDescription: 'Soothing blend of organic lemongrass and essential oils for deep relaxation.',
      fullDescription: 'A luxurious blend of organic lemongrass and carefully selected essential oils crafted to soothe tired muscles, nourish the skin, and promote deep relaxation. The warming properties of lemongrass ease tension while the blend of botanical oils conditions the skin beautifully. Absorbs without leaving a greasy residue — perfect for daily massage.',
      tags: ['Massage', 'Essential Oil', 'Relaxing'],
      featured: true
    },
    {
      id: 8,
      slug: 'seaweed-facial-cleanser',
      name: 'Seaweed Facial Cleanser',
      category: 'skin',
      price: 80000,
      image: '../assets/images/products/seaweed-facial-cleanser.webp',
      shortDescription: 'Gentle yet deeply effective cleanser made with pure sea moss extracts.',
      fullDescription: 'A gentle yet deeply effective facial cleanser made with pure sea moss and organic seaweed extracts. Removes impurities and makeup without stripping the skin\'s natural oils. Balances the skin\'s pH, soothes inflammation, and leaves your face feeling clean, refreshed, and perfectly nourished. Suitable for all skin types including sensitive skin.',
      tags: ['Face', '100ml', 'Gentle'],
      featured: false
    },
    {
      id: 9,
      slug: 'seamoss-hair-body-gel',
      name: 'Seamoss Hair & Body Gel',
      category: 'body',
      price: 50000,
      image: '../assets/images/products/seamoss-hair-body-gel.webp',
      shortDescription: 'Versatile lightweight gel for curl definition, frizz control, and skin hydration.',
      fullDescription: 'A versatile lightweight gel that works beautifully on both hair and body. Defines and enhances natural curls, smooths frizz, and deeply hydrates the skin — all with the natural power of organic sea moss. Free of synthetic hold agents. Provides a flexible, non-crunchy hold for curls and coils while maintaining moisture.',
      tags: ['Hair & Body', 'Natural Extracts'],
      featured: false
    },
    {
      id: 10,
      slug: 'seamoss-bar-soap',
      name: 'Seamoss Bar Soap',
      category: 'skin',
      price: 10000,
      image: '../assets/images/products/seamoss-bar-soap.webp',
      shortDescription: 'Daily cleansing soap rich in sea moss minerals — gentle and sulfate-free.',
      fullDescription: 'Rich in natural minerals and antioxidants, our Seamoss Bar Soap deeply cleanses and nourishes without stripping the skin. Handcrafted with organic sea moss harvested from Zanzibar\'s Indian Ocean, it is gentle enough for daily use on all skin types including sensitive skin. Free of sulfates, parabens, and synthetic fragrances.',
      tags: ['Soap', 'Sulfate-Free', 'Hypoallergenic'],
      featured: false
    },
    {
      id: 11,
      slug: 'seaweed-bundle',
      name: 'Seaweed Skin & Hair Bundle',
      category: 'bundle',
      price: 265000,
      image: '../assets/images/products/seaweed-bundle.webp',
      shortDescription: 'The ultimate MelaninGold ritual — our best skin and hair products together.',
      fullDescription: 'The ultimate MelaninGold Organic experience. This curated bundle brings together our best-loved skin and hair products for a complete organic beauty routine. Everything you need to nourish from head to toe with the healing power of Zanzibar\'s ocean. Perfect as a gift or as your personal self-care investment. Bundle contents vary by season.',
      tags: ['Bundle', 'Best Value', 'Gift Set'],
      featured: false
    }
  ];

  /* ── Private helpers ── */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
    return null;
  }

  function persist(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  /* ── Public API ── */
  return {

    /** Return all products (from localStorage or seed) */
    getAll() {
      return load() || SEED;
    },

    /** Get single product by numeric id */
    getById(id) {
      return this.getAll().find(p => p.id === id) || null;
    },

    /** Get single product by slug */
    getBySlug(slug) {
      return this.getAll().find(p => p.slug === slug) || null;
    },

    /** Filter by category string */
    getByCategory(cat) {
      if (!cat || cat === 'all') return this.getAll();
      return this.getAll().filter(p => p.category === cat);
    },

    /** Return first N featured products */
    getFeatured(n) {
      return this.getAll().filter(p => p.featured).slice(0, n);
    },

    /** Add a new product */
    add(product) {
      const all = this.getAll();
      const newId = Math.max(0, ...all.map(p => p.id)) + 1;
      const slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      const newProduct = { ...product, id: newId, slug: slug + '-' + newId };
      all.push(newProduct);
      persist(all);
      return newProduct;
    },

    /** Update an existing product by id */
    update(id, changes) {
      const all = this.getAll().map(p =>
        p.id === id ? { ...p, ...changes } : p
      );
      persist(all);
    },

    /** Remove a product by id */
    remove(id) {
      persist(this.getAll().filter(p => p.id !== id));
    },

    /** Reset to seed data */
    reset() {
      localStorage.removeItem(KEY);
    }
  };

})();
