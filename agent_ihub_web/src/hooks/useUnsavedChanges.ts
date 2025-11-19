import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, UNSAFE_NavigationContext } from 'react-router-dom';
import { App } from 'antd';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  title?: string;
}

/**
 * Hook to handle unsaved changes detection and navigation blocking
 * Similar to GitHub's "You have unsaved changes" behavior
 *
 * This implementation works with BrowserRouter (non-data router)
 */
export const useUnsavedChanges = ({
  hasUnsavedChanges,
  message = '你还有未保存的更改，确定要离开吗？',
  title = '离开此网站？',
}: UseUnsavedChangesOptions) => {
  const location = useLocation();
  const { modal } = App.useApp();
  const modalInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const navigationContext = React.useContext(UNSAFE_NavigationContext);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigator = navigationContext.navigator as any;
  const currentPathRef = useRef(location.pathname);
  const allowNavigationRef = useRef(false);
  const hasAddedHistoryRef = useRef(false);

  // Unified function to show confirmation modal
  const showConfirmModal = useCallback(
    (onConfirm: () => void) => {
      setIsBlocking(true);

      modalInstanceRef.current = modal.confirm({
        title: title,
        content: message,
        okText: '离开',
        cancelText: '取消',
        onOk: () => {
          modalInstanceRef.current = null;
          setIsBlocking(false);
          onConfirm();
        },
        onCancel: () => {
          modalInstanceRef.current = null;
          setIsBlocking(false);
        },
      });
    },
    [modal, title, message]
  );

  // Update current path ref when location changes
  useEffect(() => {
    currentPathRef.current = location.pathname;
    hasAddedHistoryRef.current = false; // Reset when location changes
  }, [location.pathname]);

  // Push a history state when unsaved changes begin (only once)
  useEffect(() => {
    if (hasUnsavedChanges && !hasAddedHistoryRef.current) {
      // Add current state to history to enable back button interception
      window.history.pushState(null, '', location.pathname);
      hasAddedHistoryRef.current = true;
    }
  }, [hasUnsavedChanges, location.pathname]);

  // Handle popstate event (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      // If navigation is allowed, don't block
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false;
        return;
      }

      // Check if there are unsaved changes
      if (hasUnsavedChanges) {
        // Block the navigation by pushing the current state back
        window.history.pushState(null, '', currentPathRef.current);

        showConfirmModal(() => {
          // Allow the next navigation
          allowNavigationRef.current = true;
          // Trigger navigation again
          window.history.back();
        });
      }
    };

    // Always listen to popstate, check hasUnsavedChanges inside
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, showConfirmModal]);

  // Intercept programmatic navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const originalPush = navigator.push;
    const originalReplace = navigator.replace;
    const originalGo = navigator.go;

    // Override push
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigator.push = (to: any, state?: any) => {
      const targetPath = typeof to === 'string' ? to : to.pathname;

      if (hasUnsavedChanges && targetPath !== currentPathRef.current) {
        showConfirmModal(() => {
          originalPush.call(navigator, to, state);
        });
        return;
      }

      originalPush.call(navigator, to, state);
    };

    // Override replace
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigator.replace = (to: any, state?: any) => {
      const targetPath = typeof to === 'string' ? to : to.pathname;

      if (hasUnsavedChanges && targetPath !== currentPathRef.current) {
        showConfirmModal(() => {
          originalReplace.call(navigator, to, state);
        });
        return;
      }

      originalReplace.call(navigator, to, state);
    };

    // Override go (for back/forward buttons)
    navigator.go = (delta: number) => {
      if (hasUnsavedChanges) {
        showConfirmModal(() => {
          originalGo.call(navigator, delta);
        });
        return;
      }

      originalGo.call(navigator, delta);
    };

    // Cleanup: restore original methods
    return () => {
      navigator.push = originalPush;
      navigator.replace = originalReplace;
      navigator.go = originalGo;

      if (modalInstanceRef.current) {
        modalInstanceRef.current.destroy();
        modalInstanceRef.current = null;
      }
    };
  }, [hasUnsavedChanges, navigator, showConfirmModal]);

  // Handle browser beforeunload event (page close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Cleanup modal on unmount
  useEffect(() => {
    return () => {
      if (modalInstanceRef.current) {
        modalInstanceRef.current.destroy();
        modalInstanceRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (modalInstanceRef.current) {
      modalInstanceRef.current.destroy();
      modalInstanceRef.current = null;
    }
    setIsBlocking(false);
  }, []);

  return {
    isBlocked: isBlocking,
    reset,
  };
};
