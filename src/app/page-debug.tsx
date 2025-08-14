export default function HomePage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>
        Debug Page - Testing Basic Rendering
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        If you can see this, the page is rendering but there might be a CSS/styling issue.
      </p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
        <h2 style={{ color: '#333' }}>Test Card</h2>
        <p>This should be visible with inline styles.</p>
      </div>
    </div>
  )
}