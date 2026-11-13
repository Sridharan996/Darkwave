import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DARKWAVE ErrorBoundary]', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020712] text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-gradient-to-br from-rose-950/70 via-slate-950/90 to-slate-950 border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.3)] backdrop-blur-2xl space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-300">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-rose-200 uppercase tracking-wide">
                  DARKWAVE System Runtime Notice
                </h2>
                <p className="text-xs text-slate-400">
                  An interface render exception occurred and was captured by the subsystem monitor.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/40 font-mono-data text-xs text-rose-300 space-y-1">
              <div className="font-bold">Error: {this.state.error?.message || 'Unknown render error'}</div>
              {this.state.error?.stack && (
                <div className="text-[10px] text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap pt-2 border-t border-slate-800">
                  {this.state.error.stack}
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-cyan-600 text-slate-950 font-display font-bold text-xs uppercase tracking-wider border border-cyan-300 hover:brightness-110 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload DARKWAVE Console</span>
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
