import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useSupplierManagement = (onSupplierUpdated) => {
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierFormData, setSupplierFormData] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Supplier data management functions
  const handleEditSupplier = useCallback((supplier) => {
    setEditingSupplier(supplier.id);
    setSupplierFormData({
      location: supplier.location || '',
      companyName: supplier.company?.name || '',
      companyAddress: supplier.company?.address || '',
      contactNumber: supplier.company?.phone || '',
      email: supplier.company?.email || '',
      companyRepresentative: supplier.representative || '',
      designation: supplier.designation || '',
      telNumber: supplier.telNumber || '',
      breakfastType: supplier.breakfastType || '',
      roomQuantity: supplier.roomQuantity || '',
      modeOfPayment: supplier.modeOfPayment || '',
      creditTerms: supplier.creditTerms || '',
      remarks: supplier.remarks || ''
    });
  }, []);

  const handleAddNewSupplier = useCallback(() => {
    setIsAddingNew(true);
    setEditingSupplier('new');
    setSupplierFormData({
      location: '',
      companyName: '',
      companyAddress: '',
      contactNumber: '',
      email: '',
      designation: '',
      modeOfPayment: '',
      creditTerms: '',
      remarks: ''
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingSupplier(null);
    setIsAddingNew(false);
    setSupplierFormData({});
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setSupplierFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveSupplier = useCallback(async (selectedSupplierType) => {
    try {
      setSavingSupplier(true);
      
      if (isAddingNew) {
        // Create new supplier
        const newSupplierData = {
          location: supplierFormData.location,
          companyName: supplierFormData.companyName,
          companyAddress: supplierFormData.companyAddress,
          contactNumber: supplierFormData.contactNumber,
          email: supplierFormData.email,
          supplierType: selectedSupplierType === 'hotels' ? 'hotel' : 'transport',
          companyRepresentative: supplierFormData.companyRepresentative,
          designation: supplierFormData.designation,
          telNumber: supplierFormData.telNumber,
          breakfastType: supplierFormData.breakfastType,
          roomQuantity: supplierFormData.roomQuantity,
          modeOfPayment: supplierFormData.modeOfPayment,
          creditTerms: supplierFormData.creditTerms,
          remarks: supplierFormData.remarks
        };

        console.log('Creating new supplier:', newSupplierData);
        const response = await apiService.createSupplier(newSupplierData);
        console.log('Supplier created successfully:', response);
        
        // Reset form
        handleCancelEdit();
        
        // Show success message
        alert('Supplier added successfully!');
      } else {
        // Update existing supplier
        const updateData = {
          location: supplierFormData.location,
          companyRepresentative: supplierFormData.companyRepresentative,
          contactNumber: supplierFormData.contactNumber,
          email: supplierFormData.email,
          designation: supplierFormData.designation,
          telNumber: supplierFormData.telNumber,
          companyAddress: supplierFormData.companyAddress,
          breakfastType: supplierFormData.breakfastType,
          roomQuantity: supplierFormData.roomQuantity,
          modeOfPayment: supplierFormData.modeOfPayment,
          creditTerms: supplierFormData.creditTerms,
          remarks: supplierFormData.remarks
        };

        console.log('Updating supplier:', editingSupplier, updateData);
        const response = await apiService.updateSupplier(editingSupplier, updateData);
        console.log('Supplier updated successfully:', response);
        
        // Reset form
        handleCancelEdit();
        
        // Show success message
        alert('Supplier updated successfully!');
        
        // Trigger a callback to refresh the data (if provided)
        if (onSupplierUpdated) {
          onSupplierUpdated();
        }
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error saving supplier. Please try again.');
    } finally {
      setSavingSupplier(false);
    }
  }, [isAddingNew, supplierFormData, editingSupplier, handleCancelEdit, onSupplierUpdated]);

  return {
    editingSupplier,
    setEditingSupplier,
    supplierFormData,
    setSupplierFormData,
    isAddingNew,
    setIsAddingNew,
    savingSupplier,
    setSavingSupplier,
    handleEditSupplier,
    handleAddNewSupplier,
    handleCancelEdit,
    handleFormChange,
    handleSaveSupplier
  };
};