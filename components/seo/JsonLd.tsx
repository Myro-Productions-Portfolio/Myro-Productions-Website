export default function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myroproductions.com'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Myro Productions',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'Rapid prototyping, automation solutions, and AI-accelerated development services.',
    founder: {
      '@type': 'Person',
      name: 'Nicolas Robert Myers',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-317-563-1247',
      contactType: 'Customer Service',
      availableLanguage: ['en'],
      email: 'nmyers@myroproductions.com',
    },
    sameAs: [
      'https://x.com/Myro_Prod_Biz',
      'https://linkedin.com/in/nicolas-myers-8b1599123',
      'https://github.com/Myro-Productions-Portfolio',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Myro Productions',
    url: siteUrl,
    description:
      'From concept to production, faster than you thought possible. Expert rapid prototyping, automation solutions, and AI-accelerated development services.',
    publisher: {
      '@type': 'Organization',
      name: 'Myro Productions',
    },
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nicolas Robert Myers',
    url: siteUrl,
    jobTitle: 'Founder & Lead Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Myro Productions',
    },
    knowsAbout: [
      'Rapid Prototyping',
      'AI Development',
      'Automation',
      'Web Development',
      'Software Development',
    ],
    sameAs: [
      'https://linkedin.com/in/nicolas-myers-8b1599123',
      'https://github.com/Myro-Productions-Portfolio',
      'https://x.com/Myro_Prod_Biz',
    ],
  }

  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Myro Productions',
    url: siteUrl,
    description:
      'From concept to production, faster than you thought possible. Expert rapid prototyping, automation solutions, and AI-accelerated development services.',
    priceRange: '$$',
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    serviceType: [
      'Rapid Prototyping',
      'Automation Solutions',
      'AI-Accelerated Development',
      'Web Development',
      'Software Development',
      'MVP Development',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
    </>
  )
}
