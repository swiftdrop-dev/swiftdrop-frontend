import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getDismissedReason: () => string;
            getNotDisplayedReason?: () => string;
            getSkippedReason?: () => string;
          }) => void) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  label?: string;
  onCredential: (credential: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  label = 'Sign in with Google',
  onCredential,
  onError,
  disabled = false,
  loading = false,
}) => {
  const [gisLoaded, setGisLoaded] = useState<boolean>(() => typeof window !== 'undefined' && !!window.google?.accounts?.id);
  const clientId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || '';

  // Use refs to avoid re-initializing GIS on parent re-renders
  const onCredentialRef = React.useRef(onCredential);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    // Load GIS script dynamically once if not already present
    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript && clientId) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setGisLoaded(true);
      script.onerror = () => {
        console.warn('Failed to load Google Identity Services script.');
      };
      document.head.appendChild(script);
    } else if (existingScript) {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setGisLoaded(true));
      }
    }
  }, [clientId]);

  const googleBtnContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gisLoaded && window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onCredentialRef.current(response.credential);
            } else if (onErrorRef.current) {
              onErrorRef.current('Google authentication failed: no credential received.');
            }
          },
          cancel_on_tap_outside: true,
        });

        if (googleBtnContainerRef.current) {
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: label.toLowerCase().includes('sign up') ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 384,
          });
        }
      } catch (e) {
        // Safe error logging without exposing sensitive data
        console.warn('GIS initialize error:', e);
      }
    }

    return () => {
      // Clean up prompt on unmount if active
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          (window.google.accounts.id as any).cancel?.();
        } catch {
          // ignore
        }
      }
    };
  }, [gisLoaded, clientId, label]);

  const handleClick = () => {
    if (disabled || loading) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification?.isDismissedMoment?.()) {
            const reason = notification.getDismissedReason?.();
            if (reason && reason !== 'credential_returned') {
              onErrorRef.current?.('Google Sign-In was cancelled.');
            }
          } else if (notification?.isNotDisplayed?.()) {
            const reason = notification.getNotDisplayedReason?.();
            console.info('Google One Tap not displayed:', reason);
            if (reason === 'unregistered_origin') {
              onErrorRef.current?.('Google Sign-In configuration error: This origin is not registered in Google Cloud Console.');
            }
          }
        });
      } catch {
        onErrorRef.current?.('Google Sign-In is unavailable. Try again or use email and password.');
      }
    } else {
      onErrorRef.current?.('Google Sign-In is not configured.');
    }
  };

  return (
    <div
      className="google-signin-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        className="btn btn-outline w-full google-signin-btn"
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: '#ffffff',
          color: '#3c4043',
          borderColor: '#dadce0',
          fontWeight: 500,
          fontSize: '0.925rem',
          padding: '10px 16px',
          borderRadius: 8,
          transition: 'background-color 0.2s, box-shadow 0.2s, border-color 0.2s',
          boxShadow: '0 1px 2px rgba(60,64,67,0.08), 0 1px 3px 1px rgba(60,64,67,0.04)',
          width: '100%',
          minHeight: 44,
        }}
      >
      {loading ? (
        <div
          className="spinner"
          style={{
            width: 18,
            height: 18,
            borderWidth: 2,
            borderColor: '#4285F4',
            borderRightColor: 'transparent',
          }}
        />
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
          />
        </svg>
      )}
      <span>{loading ? 'Authenticating…' : label}</span>
      </button>

      {/* Official Google GIS Button Overlay */}
      {gisLoaded && clientId && (
        <div
          ref={googleBtnContainerRef}
          className="google-gis-rendered-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.001,
            overflow: 'hidden',
            pointerEvents: disabled || loading ? 'none' : 'auto',
            zIndex: 2,
            cursor: 'pointer',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

