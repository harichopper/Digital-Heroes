import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { connectDB } from '@/lib/mongodb';
import { Charity } from '@/models/Charity';

type CharityPageData = {
  name: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  isFeatured: boolean;
  websiteUrl?: string;
  totalReceived: number;
};

function formatCurrency(pence: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(pence / 100);
}

export default async function CharityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const charity = await Charity.findOne({ slug, isActive: true }).lean<CharityPageData>();
  if (!charity) notFound();

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section className="section">
          <div className="container container-md">
            <Link href="/charities" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-8)', paddingLeft: 0 }}>
              <ArrowLeft size={16} /> All Charities
            </Link>

            <div className="card" style={{ marginBottom: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#10b981,#a855f7)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg,#10b981,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                  💚
                </div>
                <div style={{ flex: 1 }}>
                  {charity.isFeatured && <span className="badge badge-warm" style={{ marginBottom: 'var(--space-3)' }}>✨ Featured</span>}
                  <h1 className="text-h1" style={{ marginBottom: 'var(--space-2)' }}>{charity.name}</h1>
                  {charity.category && <span className="badge badge-neutral" style={{ marginBottom: 'var(--space-4)' }}>{charity.category}</span>}
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <div className="text-h3 text-gradient">{formatCurrency(charity.totalReceived)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Raised</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  {charity.websiteUrl && (
                    <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      <ExternalLink size={14} /> Website
                    </a>
                  )}
                  <Link href="/auth/signup" className="btn btn-accent btn-sm">
                    <Heart size={14} /> Support This Charity
                  </Link>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>About</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {charity.description || charity.shortDescription}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const charity = await Charity.findOne({ slug }).lean<CharityPageData>();
  return {
    title: charity ? `${charity.name} — Digital Heroes` : 'Charity — Digital Heroes',
    description: charity?.shortDescription || '',
  };
}
