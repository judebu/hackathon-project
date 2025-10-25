<<<<<<< HEAD
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Discover Local Gems',
    description:
      'Search curated lists and student favorites to find your next go-to spot near campus.',
    accent: '01',
  },
  {
    title: 'Review With Confidence',
    description:
      'Share thoughtful reviews, add photos, and rate experiences so friends know what to try.',
    accent: '02',
  },
  {
    title: 'Tailored Suggestions',
    description:
      'Track what you love, filter by cuisine or dietary needs, and let Terrier Taste surface options for you.',
    accent: '03',
  },
];

const highlights = [
  { value: '125+', label: 'BU dining spots reviewed' },
  { value: '4.6/5', label: 'Average community rating' },
  { value: '24/7', label: 'Updates from local foodies' },
];

export default function Home() {
  const styles = {
    main: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff4f6 0%, #ffffff 40%, #ffe6ea 100%)',
    },
    hero: {
      padding: '4rem 1.5rem 3rem',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center' as const,
    },
    h1: {
      fontSize: 'clamp(2.4rem, 6vw, 3.75rem)',
      fontWeight: 800,
      color: '#2d0c15',
      marginBottom: '1rem',
      lineHeight: 1.18,
    },
    brandName: {
      color: '#dc143c',
    },
    heroText: {
      fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
      color: '#50323a',
      marginBottom: '2.5rem',
      maxWidth: '680px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    highlightRow: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      marginBottom: '2.5rem',
    },
    highlightCard: {
      background: 'rgba(255, 255, 255, 0.85)',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid rgba(122, 12, 34, 0.18)',
      boxShadow: '0 18px 40px -30px rgba(122, 12, 34, 0.6)',
    },
    highlightValue: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#7a0c22',
      display: 'block',
    },
    highlightLabel: {
      fontSize: '0.95rem',
      color: '#5b1a29',
      marginTop: '0.35rem',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      alignItems: 'center',
    },
    primaryButton: {
      width: '100%',
      maxWidth: '280px',
      padding: '1rem 2rem',
      backgroundColor: '#dc143c',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 600,
      borderRadius: '0.75rem',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: '0 18px 35px -20px rgba(220, 20, 60, 0.6)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    secondaryButton: {
      width: '100%',
      maxWidth: '280px',
      padding: '1rem 2rem',
      backgroundColor: 'white',
      color: '#dc143c',
      fontSize: '1.1rem',
      fontWeight: 600,
      borderRadius: '0.75rem',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: '0 16px 30px -24px rgba(122, 12, 34, 0.45)',
      border: '1px solid rgba(220, 20, 60, 0.32)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    featuresSection: {
      padding: '4rem 1.5rem',
      backgroundColor: '#fff',
    },
    featuresContainer: {
      maxWidth: '1150px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: 'clamp(1.9rem, 4.5vw, 2.5rem)',
      fontWeight: 700,
      textAlign: 'center' as const,
      color: '#2d0c15',
      marginBottom: '2.75rem',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.75rem',
    },
    featureCard: {
      textAlign: 'left' as const,
      padding: '1.75rem',
      borderRadius: '1rem',
      background: 'linear-gradient(160deg, rgba(255, 246, 247, 0.95), #ffffff)',
      border: '1px solid rgba(122, 12, 34, 0.12)',
      boxShadow: '0 20px 42px -36px rgba(122, 12, 34, 0.65)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      display: 'grid',
      gap: '1rem',
    },
    accentIcon: {
      width: '52px',
      height: '52px',
      borderRadius: '16px',
      background: '#ffe5ea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      fontWeight: 700,
      color: '#7a0c22',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#3a1820',
    },
    featureText: {
      color: '#5b1a29',
      lineHeight: 1.6,
      fontSize: '0.98rem',
    },
    ctaSection: {
      padding: '4.5rem 1.5rem',
      background: 'linear-gradient(120deg, #7a0c22, #dc143c)',
      textAlign: 'center' as const,
    },
    ctaContainer: {
      maxWidth: '900px',
      margin: '0 auto',
    },
    ctaTitle: {
      fontSize: 'clamp(1.9rem, 4.5vw, 2.5rem)',
      fontWeight: 700,
      color: 'white',
      marginBottom: '1.25rem',
    },
    ctaText: {
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.88)',
      marginBottom: '2rem',
      lineHeight: 1.7,
    },
    ctaButton: {
      padding: '1rem 2.5rem',
      backgroundColor: 'white',
      color: '#dc143c',
      fontSize: '1.1rem',
      fontWeight: 600,
      borderRadius: '0.75rem',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 22px 44px -32px rgba(0, 0, 0, 0.35)',
    },
    footer: {
      backgroundColor: '#7a0c22',
      color: 'white',
      padding: '2.5rem 1.5rem',
      textAlign: 'center' as const,
    },
    footerText: {
      color: 'rgba(255, 255, 255, 0.82)',
      fontSize: '0.95rem',
    },
  } as const;

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.h1}>
          Discover <span style={styles.brandName}>Terrier Taste</span>
        </h1>
        <p style={styles.heroText}>
          Boston University’s dining companion built by students, for students. Track the places you love,
          find new ones worth the trip, and share honest feedback with the community.
        </p>

        <div style={styles.highlightRow}>
          {highlights.map((item) => (
            <div key={item.label} style={styles.highlightCard}>
              <span style={styles.highlightValue}>{item.value}</span>
              <span style={styles.highlightLabel}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={styles.buttonContainer}>
          <Link to="/explore" style={styles.primaryButton}>
            Explore restaurants
          </Link>
          <Link to="/auth" style={styles.secondaryButton}>
            Create an account
          </Link>
        </div>
      </section>

      <section style={styles.featuresSection}>
        <div style={styles.featuresContainer}>
          <h2 style={styles.sectionTitle}>A smarter way to eat around BU</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature) => (
              <div
                key={feature.title}
                style={styles.featureCard}
                onMouseEnter={(event) => {
                  (event.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (event.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 26px 48px -36px rgba(122, 12, 34, 0.8)';
                }}
                onMouseLeave={(event) => {
                  (event.currentTarget as HTMLDivElement).style.transform = 'none';
                  (event.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 20px 42px -36px rgba(122, 12, 34, 0.65)';
                }}
              >
                <div style={styles.accentIcon} aria-hidden="true">
                  {feature.accent}
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureText}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaContainer}>
          <h2 style={styles.ctaTitle}>Ready to plan your next meal?</h2>
          <p style={styles.ctaText}>
            Join Terrier Taste to bookmark top spots, follow dining trends, and champion the restaurants you love.
          </p>
          <Link to="/auth" style={styles.ctaButton}>
            Sign up now
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© {new Date().getFullYear()} Terrier Taste. Built at BU, inspired by Boston.</p>
      </footer>
    </main>
  );
=======
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-4">Terrier Taste</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-lg">
        Discover the best bites around campus and beyond. Join a community of food lovers.
      </p>
      <Link
        to="/explore"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Explore Now
      </Link>
    </main>
  )
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
}
