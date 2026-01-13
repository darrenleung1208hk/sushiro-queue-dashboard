import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export type ViewMode = 'grid' | 'table';

export const useViewMode = () => {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Load view mode preference from localStorage
  useEffect(() => {
    try {
      const savedView = localStorage.getItem('dashboard-view-mode');
      if (savedView === 'grid' || savedView === 'table') {
        setViewMode(savedView);
      }
      // Migration: if user had 'list' saved, default to 'grid'
      if (savedView === 'list') {
        localStorage.setItem('dashboard-view-mode', 'grid');
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
  const handleViewModeChange = (mode: ViewMode) => {
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
