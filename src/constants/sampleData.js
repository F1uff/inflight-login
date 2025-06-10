// User and application data
export const userData = {
  name: 'REINER REBAYNO',
  role: 'ADMIN'
};

// Portfolio card counts
export const supplierData = {
  hotel: 1970,
  transfer: 45,
  airline: 7,
  travelOperator: 200
};

// Hotel service statistics
export const hotelServiceStats = {
  request: 12,
  checkin: 6,
  totalService: 34
};

// Sample supplier lists
export const hotelSuppliersList = [
  {
    id: 1,
    location: 'MANILA',
    propertyName: 'RED PLANET MANILA MALATE',
    propertyAddress: '1740 A. Mabini St. Manila',
    contractedRates: 'Jan. 10, 2025',
    corporateRates: 'N/A',
    validity: 'Dec. 31, 2025',
    remarks: 'Accredited',
    status: 'active'
  },
  {
    id: 2,
    location: 'TAGUIG',
    propertyName: 'F1 HOTEL MANILA',
    propertyAddress: '32nd Street, corner Lane A',
    contractedRates: 'Feb. 26, 2025',
    corporateRates: 'March 5, 2025',
    validity: 'Dec. 31, 2025',
    remarks: 'Accredited Prepaid',
    status: 'pending'
  }
];

export const landTransferSuppliersList = [
  {
    id: 1,
    location: 'BAGUIO',
    companyName: 'HAT Transport',
    companyAddress: 'Baguio City',
    tariffRate: 'N/A',
    validity: 'N/A',
    remarks: 'Non Accredited',
    status: 'inactive'
  }
];

// Sample accounts data
export const accountsData = [
  {
    id: 'TIM001',
    name: 'Mark Reiner Rebayno',
    designation: 'Business Development Assistant',
    company: 'Inflight Menu Travel Corp.',
    email: 'bredoy@inflightmenuph.com',
    group: 'Admin',
    status: 'active'
  },
  {
    id: 'TIM002',
    name: 'Luigi Morales',
    designation: 'IT',
    company: 'Inflight Menu Travel Corp.',
    email: '',
    group: 'Admin',
    status: 'active'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Travel Desk',
    status: 'inactive'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Supplier',
    status: 'active'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Supplier',
    status: 'active'
  }
];

// Sample hotel booking data
export const hotelBookingData = [
  {
    id: 1,
    hotelVoucher: 'HV-001',
    hotelReference: 'REF-001',
    coveredDate: 'Jan 15, 2025\nJan 16, 2025',
    guestName: 'John Doe',
    contactNumber: '0917-123-4567',
    noOfStay: '2 nights',
    branch: 'Manila',
    status: 'checkin'
  },
  {
    id: 2,
    hotelVoucher: 'HV-002',
    hotelReference: 'REF-002',
    coveredDate: 'Jan 20, 2025\nJan 22, 2025',
    guestName: 'Jane Smith',
    contactNumber: '0917-987-6543',
    noOfStay: '3 nights',
    branch: 'Cebu',
    status: 'request'
  },
  {
    id: 3,
    hotelVoucher: 'HV-003',
    hotelReference: 'REF-003',
    coveredDate: 'Jan 25, 2025\nJan 27, 2025',
    guestName: 'Bob Johnson',
    contactNumber: '0917-555-1234',
    noOfStay: '2 nights',
    branch: 'Davao',
    status: 'checkout'
  },
  {
    id: 4,
    hotelVoucher: 'HV-004',
    hotelReference: 'REF-004',
    coveredDate: 'Feb 1, 2025\nFeb 3, 2025',
    guestName: 'Alice Brown',
    contactNumber: '0917-444-5678',
    noOfStay: '2 nights',
    branch: 'Baguio',
    status: 'cancelled'
  }
];

// Sample monitoring data
export const monitoringData = [
  {
    id: 1,
    travelDate: 'May 24, 2025',
    pickupTime: '04:12 AM',
    guestName: 'Mr. Mark Reiner Rebayno',
    clientNumber: '0917-152-8222',
    pickupLocation: 'NAC BGC',
    destination: 'BATAAN',
    status: 'active'
  },
  {
    id: 2,
    travelDate: 'May 24, 2025',
    pickupTime: '09:43 PM',
    guestName: 'Mr. Mark Reiner Rebayno',
    clientNumber: '0917-152-8222',
    pickupLocation: 'QUEZON CITY',
    destination: 'LAGUNA',
    status: 'pending'
  },
  {
    id: 3,
    travelDate: 'May 24, 2025',
    pickupTime: '04:12 AM',
    guestName: 'Mr. Mark Reiner Rebayno',
    clientNumber: '0917-152-8222',
    pickupLocation: 'NAC BGC',
    destination: 'BATAAN',
    status: 'active'
  },
  {
    id: 4,
    travelDate: 'May 24, 2025',
    pickupTime: '09:43 PM',
    guestName: 'Mr. Mark Reiner Rebayno',
    clientNumber: '0917-152-8222',
    pickupLocation: 'QUEZON CITY',
    destination: 'LAGUNA',
    status: 'pending'
  }
];

// Accounts statistics
export const accountsStats = {
  allEmployees: 6,
  active: 4,
  pending: 1
};

// Suppliers page statistics
export const suppliersStats = {
  accredited: { value: 1970, color: '#4CAF50' },
  accreditedPrepaid: { value: 45, color: '#FF9800' },
  nonAccredited: { value: 7, color: '#F44336' },
  ncrLuzon: { value: 1970, color: '#2196F3' },
  visayas: { value: 45, color: '#4CAF50' },
  mindanao: { value: 7, color: '#00BCD4' }
}; 