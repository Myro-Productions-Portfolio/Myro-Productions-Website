import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'Myro Productions - Rapid Prototyping & AI Development'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Open Graph Image generation
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1c1c1c',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(26, 46, 26, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(130, 245, 130, 0.1) 0%, transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #82f582, #1a2e1a)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
              fontFamily: 'monospace',
            }}
          >
            Myro Productions
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#a3a3a3',
              textAlign: 'center',
              maxWidth: 900,
              marginTop: 20,
              fontFamily: 'monospace',
            }}
          >
            From concept to production, faster than you thought possible
          </div>
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginTop: 60,
              fontSize: 24,
              color: '#82f582',
              fontFamily: 'monospace',
            }}
          >
            <span>Rapid Prototyping</span>
            <span>•</span>
            <span>Automation</span>
            <span>•</span>
            <span>AI Development</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
