"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
            <div className="backdrop-blur-md bg-white/5 border border-[#FF00FF]/40 rounded-lg p-8 max-w-md text-center">
              <h2 className="text-2xl font-bold text-[#FF00FF] mb-3">Something went wrong</h2>
              <p className="text-gray-400 text-sm mb-6">{this.state.message}</p>
              <button
                onClick={() => this.setState({ hasError: false, message: "" })}
                className="px-6 py-3 border-2 border-neon-cyan rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
