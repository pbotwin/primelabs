import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryState = { failed: boolean };

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PrimeLabs storefront failed to render", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="app-error" role="alert">
        <img src="./logo-ink.svg" alt="PrimeLabs" />
        <h1>Something went wrong</h1>
        <p>Please reload the page and try again.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </main>
    );
  }
}
