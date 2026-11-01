import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Unexpected rendering error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080c] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#111522] border-2 border-red-500/60 p-6 rounded-lg shadow-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-red-400 mb-2">
              [SYSTEM RECOVERY MODE]
            </p>
            <h1 className="text-xl font-bold mb-2">Basoori Graphics UI Encountered an Error</h1>
            <p className="text-sm text-slate-300 mb-4 font-mono bg-black/50 p-3 rounded">
              {this.state.message}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('basoori_graphics_v2_state');
                window.location.reload();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-sm"
            >
              Reset Local Cache & Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
