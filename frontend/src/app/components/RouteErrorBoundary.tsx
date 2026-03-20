import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route rendering failed:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-shell py-12">
          <div className="page-panel mx-auto max-w-[720px] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-black text-slate-950">페이지를 불러오는 중 오류가 발생했습니다.</h1>
            <p className="mt-3 text-sm font-medium text-slate-500">{this.state.errorMessage}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={this.handleReload} className="rounded-full px-5">
                새로고침
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
