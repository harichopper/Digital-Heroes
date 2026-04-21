'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SkeletonCard } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';
import Link from 'next/link';

type Charity = {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  category?: string;
  isFeatured: boolean;
  totalReceived: number;
};

function formatCurrency(pence: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(pence / 100);
}

export default function CharitiesPage() {
  const { withLoading } = useGlobalLoader();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadCharities = useCallback(() => withLoading(
      () => fetch('/api/charities').then(r => r.json()),
      'Loading charities…', 'Discovering charity partners'
    ).then(d => { setCharities(d.charities || []); setLoading(false); }).catch(() => setLoading(false)), [withLoading]);

  useEffect(() => {
    loadCharities();
  }, [loadCharities]);

  const categories = ['all', ...Array.from(new Set(charities.map((c) => c.category || '').filter(Boolean)))];
  const filtered = charities.filter((c) => {
    const s = c.name.toLowerCase().includes(search.toLowerCase()) || c.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const cat = category === 'all' || c.category === category;
    return s && cat;
  });
  const featured = charities.filter((c) => c.isFeatured);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section className="section" style={{ textAlign: 'center' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.span className="badge badge-accent" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Heart size={12} /> Our Charity Partners
              </motion.span>
              <h1 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
                Charities Making a <span className="text-gradient">Difference</span>
              </h1>
              <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto var(--space-8)' }}>
                Browse our curated directory of verified charities. Your subscription directly funds the causes you care about.
              </p>

              {/* Search */}
              <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" placeholder="Search charities..." value={search} onChange={(e) => setSearch(e.target.value)} id="charity-search" style={{ paddingLeft: 46, fontSize: '1rem' }} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section style={{ paddingBottom: 'var(--space-8)' }}>
          <div className="container">
            <div className="tabs" style={{ justifyContent: 'center', borderBottom: 'none', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <motion.button key={cat} className={`tab ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}
                  style={{ textTransform: 'capitalize' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        {!loading && featured.length > 0 && category === 'all' && !search && (
          <section style={{ paddingBottom: 'var(--space-10)' }}>
            <div className="container">
              <h2 className="text-h3" style={{ marginBottom: 'var(--space-6)' }}>✨ Featured Charities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)' }}>
                {featured.map((c, i) => (
                  <motion.div key={c._id} className="card card-glow" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }} style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient-primary)' }} />
                    <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)' }}>Featured</span>
                    <h3 className="text-h4" style={{ marginBottom: 'var(--space-2)' }}>{c.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.7 }}>{c.shortDescription}</p>
                    {c.category && <span className="badge badge-neutral">{c.category}</span>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-5)' }}>
                      <div>
                        <div className="text-h4 text-gradient">{formatCurrency(c.totalReceived)}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Raised</div>
                      </div>
                      <Link href={`/charities/${c.slug}`} className="btn btn-primary btn-sm" id={`featured-${c.slug}`}>
                        Learn More <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All charities */}
        <section className="section-sm">
          <div className="container">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)' }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} height={200} />)}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div className="card empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Heart size={48} />
                </motion.div>
                <h3>No charities found</h3>
                <p>Try a different search or category</p>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-5)' }}>
                {filtered.map((c, i) => (
                  <motion.div key={c._id} className="card" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <motion.div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}
                        whileHover={{ rotate: 10, scale: 1.1 }}>💚</motion.div>
                      {c.category && <span className="badge badge-neutral">{c.category}</span>}
                    </div>
                    <h3 className="text-h4" style={{ marginBottom: 'var(--space-2)' }}>{c.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.7 }}>{c.shortDescription}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(c.totalReceived)} raised</span>
                      <Link href={`/charities/${c.slug}`} className="btn btn-ghost btn-sm">View <ArrowRight size={12} /></Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
