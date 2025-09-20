import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export const useViewMode = () => {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load view mode preference from localStorage
  useEffect(() => {
    try {
      const savedView = localStorage.getItem('dashboard-view-mode');
      if (savedView === 'grid' || savedView === 'list') {
        setViewMode(savedView);
      }
    } catch (error) {
      // Fallback to default grid view if localStorage is unavailable
      console.warn(t('errors.unableToLoadData'), error);
    }
  }, [t]);

  // Save view mode preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-view-mode', viewMode);
    } catch (error) {
      // Silently fail if localStorage is unavailable
      console.warn(t('errors.unableToLoadData'), error);
    }
  }, [viewMode, t]);

  // Handle view mode change
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (mode !== viewMode) {
      setViewMode(mode);
    }
  };

  return {
    viewMode,
    setViewMode,
    handleViewModeChange,
  };
};
