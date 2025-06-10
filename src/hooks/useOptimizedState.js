import { useState, useCallback } from 'react';

// Manages expanding/collapsing rows in a table (like accordion functionality)
export const useTableExpansion = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRowExpansion = useCallback((id) => {
    setExpandedRowId(prev => prev === id ? null : id);
  }, []);

  const isExpanded = useCallback((id) => {
    return expandedRowId === id;
  }, [expandedRowId]);

  const resetExpansion = useCallback(() => {
    setExpandedRowId(null);
  }, []);

  return {
    expandedRowId,
    toggleRowExpansion,
    isExpanded,
    resetExpansion
  };
};

// Handles dropdown selection and filter state changes
export const useFilter = (initialValue = '') => {
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const handleChange = useCallback((value) => {
    setSelectedValue(value);
  }, []);

  const resetFilter = useCallback(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  return {
    selectedValue,
    handleChange,
    resetFilter
  };
};

// Manages navigation and collapsible menu state for sidebar navigation
export const useNavigation = (initialView = 'dashboard') => {
  const [currentView, setCurrentView] = useState(initialView);
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleNavClick = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const toggleMenu = useCallback((menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  }, []);

  const isMenuExpanded = useCallback((menuId) => {
    return expandedMenus[menuId] || false;
  }, [expandedMenus]);

  return {
    currentView,
    handleNavClick,
    expandedMenus,
    toggleMenu,
    isMenuExpanded
  };
}; 