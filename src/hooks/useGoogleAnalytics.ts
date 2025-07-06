
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAnalytics = (measurementId?: string) => {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId || import.meta.env.MODE !== 'production') {
      return;
    }

    try {
      // Load Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      return () => {
        try {
          document.head.removeChild(script);
        } catch (e) {
          // Script might have already been removed
        }
      };
    } catch (error) {
      console.error('Google Analytics initialization error:', error);
    }
  }, [measurementId]);

  // Track page views
  useEffect(() => {
    if (!measurementId || !window.gtag) {
      return;
    }

    try {
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    } catch (error) {
      console.error('Google Analytics page tracking error:', error);
    }
  }, [location, measurementId]);

  // Return tracking functions
  const trackEvent = (eventName: string, parameters?: any) => {
    if (window.gtag && measurementId) {
      try {
        window.gtag('event', eventName, parameters);
      } catch (error) {
        console.error('Google Analytics event tracking error:', error);
      }
    }
  };

  const trackConversion = (conversionId: string, value?: number) => {
    if (window.gtag && measurementId) {
      try {
        window.gtag('event', 'conversion', {
          send_to: conversionId,
          value: value,
          currency: 'USD'
        });
      } catch (error) {
        console.error('Google Analytics conversion tracking error:', error);
      }
    }
  };

  return { trackEvent, trackConversion };
};
