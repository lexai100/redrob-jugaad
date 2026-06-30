import { Suspense } from 'react';
import ShortlistPage from './ShortlistClient';

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{
          width: 20, height: 20,
          border: '2px solid #E2DCF5',
          borderTopColor: '#2A0E72',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    }>
      <ShortlistPage />
    </Suspense>
  );
}
