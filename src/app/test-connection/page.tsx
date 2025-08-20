export default function TestPage() {
  return (
    <div style={{
      background: 'red',
      color: 'white',
      fontSize: '50px',
      textAlign: 'center',
      padding: '100px',
      minHeight: '100vh'
    }}>
      <h1>🚨 NEXT.JS TEST PAGE - IF YOU SEE THIS, IT&apos;S WORKING! 🚨</h1>
      <p>This is a test page in your Next.js app</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}
