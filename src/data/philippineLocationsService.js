// Philippine Locations Service
// This service provides functions to access the complete Philippine location data

// Import the complete data
import completeData from './complete_ph_locations.json';

// Extract regions
export const getRegions = () => {
  return Object.keys(completeData).map(regionKey => {
    const regionData = completeData[regionKey];
    return {
      id: regionKey,
      name: regionData.region_name
    };
  });
};

// Get provinces for a specific region
export const getProvincesByRegion = (regionKey) => {
  if (!regionKey || !completeData[regionKey]) return [];
  
  return Object.keys(completeData[regionKey].province_list).map(provinceKey => {
    return {
      id: provinceKey,
      name: provinceKey,
      regionId: regionKey
    };
  });
};

// Get cities/municipalities for a specific province
export const getCitiesByProvince = (regionKey, provinceKey) => {
  if (!regionKey || !provinceKey || !completeData[regionKey] || !completeData[regionKey].province_list[provinceKey]) {
    return [];
  }
  
  return Object.keys(completeData[regionKey].province_list[provinceKey].municipality_list).map(cityKey => {
    return {
      id: cityKey,
      name: cityKey,
      provinceId: provinceKey,
      regionId: regionKey
    };
  });
};

// Get barangays for a specific city/municipality
export const getBarangaysByCity = (regionKey, provinceKey, cityKey) => {
  if (!regionKey || !provinceKey || !cityKey || 
      !completeData[regionKey] || 
      !completeData[regionKey].province_list[provinceKey] || 
      !completeData[regionKey].province_list[provinceKey].municipality_list[cityKey]) {
    return [];
  }
  
  return completeData[regionKey].province_list[provinceKey].municipality_list[cityKey].barangay_list.map(barangay => {
    return {
      id: barangay,
      name: barangay,
      cityId: cityKey,
      provinceId: provinceKey,
      regionId: regionKey
    };
  });
};

// Common zip codes for major cities
export const zipCodes = {
  // Metro Manila
  'City of Manila': '1000',
  'Quezon City': '1100',
  'Makati City': '1200',
  'Pasay City': '1300',
  'Parañaque City': '1700',
  'Pasig City': '1600',
  'Taguig City': '1630',
  'Mandaluyong City': '1550',
  'San Juan City': '1500',
  'Caloocan City': '1400',
  'Marikina City': '1800',
  'Muntinlupa City': '1770',
  'Las Piñas City': '1740',
  'Valenzuela City': '1440',
  'Navotas City': '1485',
  'Malabon City': '1470',
  'Pateros': '1620',
  
  // Luzon
  'Antipolo City': '1870',
  'Bacoor City': '4102',
  'Batangas City': '4200',
  'Calamba City': '4027',
  'Dasmariñas City': '4114',
  'Imus City': '4103',
  'San Pablo City': '4000',
  'Santa Rosa City': '4026',
  'Tagaytay City': '4120',
  'Lipa City': '4217',
  
  // Visayas
  'Cebu City': '6000',
  'Lapu-Lapu City': '6015',
  'Mandaue City': '6014',
  'Iloilo City': '5000',
  'Bacolod City': '6100',
  'Tacloban City': '6500',
  
  // Mindanao
  'Davao City': '8000',
  'Cagayan de Oro City': '9000',
  'General Santos City': '9500',
  'Zamboanga City': '7000',
  'Iligan City': '9200',
  'Butuan City': '8600'
};

// Get zip code for a city if available
export const getZipCode = (cityName) => {
  return zipCodes[cityName] || '';
};
