// Comprehensive database of Philippine locations

export const regions = [
  { id: 'NCR', name: 'National Capital Region' },
  { id: 'CAR', name: 'Cordillera Administrative Region' },
  { id: 'R1', name: 'Region I - Ilocos Region' },
  { id: 'R2', name: 'Region II - Cagayan Valley' },
  { id: 'R3', name: 'Region III - Central Luzon' },
  { id: 'R4A', name: 'Region IV-A - CALABARZON' },
  { id: 'R4B', name: 'Region IV-B - MIMAROPA' },
  { id: 'R5', name: 'Region V - Bicol Region' },
  { id: 'R6', name: 'Region VI - Western Visayas' },
  { id: 'R7', name: 'Region VII - Central Visayas' },
  { id: 'R8', name: 'Region VIII - Eastern Visayas' },
  { id: 'R9', name: 'Region IX - Zamboanga Peninsula' },
  { id: 'R10', name: 'Region X - Northern Mindanao' },
  { id: 'R11', name: 'Region XI - Davao Region' },
  { id: 'R12', name: 'Region XII - SOCCSKSARGEN' },
  { id: 'R13', name: 'Region XIII - Caraga' },
  { id: 'BARMM', name: 'Bangsamoro Autonomous Region in Muslim Mindanao' }
];

export const provinces = {
  'NCR': [
    { id: 'Metro Manila', name: 'Metro Manila' }
  ],
  'CAR': [
    { id: 'Abra', name: 'Abra' },
    { id: 'Apayao', name: 'Apayao' },
    { id: 'Benguet', name: 'Benguet' },
    { id: 'Ifugao', name: 'Ifugao' },
    { id: 'Kalinga', name: 'Kalinga' },
    { id: 'Mountain Province', name: 'Mountain Province' }
  ],
  'R1': [
    { id: 'Ilocos Norte', name: 'Ilocos Norte' },
    { id: 'Ilocos Sur', name: 'Ilocos Sur' },
    { id: 'La Union', name: 'La Union' },
    { id: 'Pangasinan', name: 'Pangasinan' }
  ],
  'R2': [
    { id: 'Batanes', name: 'Batanes' },
    { id: 'Cagayan', name: 'Cagayan' },
    { id: 'Isabela', name: 'Isabela' },
    { id: 'Nueva Vizcaya', name: 'Nueva Vizcaya' },
    { id: 'Quirino', name: 'Quirino' }
  ],
  'R3': [
    { id: 'Aurora', name: 'Aurora' },
    { id: 'Bataan', name: 'Bataan' },
    { id: 'Bulacan', name: 'Bulacan' },
    { id: 'Nueva Ecija', name: 'Nueva Ecija' },
    { id: 'Pampanga', name: 'Pampanga' },
    { id: 'Tarlac', name: 'Tarlac' },
    { id: 'Zambales', name: 'Zambales' }
  ],
  'R4A': [
    { id: 'Batangas', name: 'Batangas' },
    { id: 'Cavite', name: 'Cavite' },
    { id: 'Laguna', name: 'Laguna' },
    { id: 'Quezon', name: 'Quezon' },
    { id: 'Rizal', name: 'Rizal' }
  ],
  'R4B': [
    { id: 'Marinduque', name: 'Marinduque' },
    { id: 'Occidental Mindoro', name: 'Occidental Mindoro' },
    { id: 'Oriental Mindoro', name: 'Oriental Mindoro' },
    { id: 'Palawan', name: 'Palawan' },
    { id: 'Romblon', name: 'Romblon' }
  ],
  'R5': [
    { id: 'Albay', name: 'Albay' },
    { id: 'Camarines Norte', name: 'Camarines Norte' },
    { id: 'Camarines Sur', name: 'Camarines Sur' },
    { id: 'Catanduanes', name: 'Catanduanes' },
    { id: 'Masbate', name: 'Masbate' },
    { id: 'Sorsogon', name: 'Sorsogon' }
  ],
  'R6': [
    { id: 'Aklan', name: 'Aklan' },
    { id: 'Antique', name: 'Antique' },
    { id: 'Capiz', name: 'Capiz' },
    { id: 'Guimaras', name: 'Guimaras' },
    { id: 'Iloilo', name: 'Iloilo' },
    { id: 'Negros Occidental', name: 'Negros Occidental' }
  ],
  'R7': [
    { id: 'Bohol', name: 'Bohol' },
    { id: 'Cebu', name: 'Cebu' },
    { id: 'Negros Oriental', name: 'Negros Oriental' },
    { id: 'Siquijor', name: 'Siquijor' }
  ],
  'R8': [
    { id: 'Biliran', name: 'Biliran' },
    { id: 'Eastern Samar', name: 'Eastern Samar' },
    { id: 'Leyte', name: 'Leyte' },
    { id: 'Northern Samar', name: 'Northern Samar' },
    { id: 'Samar', name: 'Samar' },
    { id: 'Southern Leyte', name: 'Southern Leyte' }
  ],
  'R9': [
    { id: 'Zamboanga del Norte', name: 'Zamboanga del Norte' },
    { id: 'Zamboanga del Sur', name: 'Zamboanga del Sur' },
    { id: 'Zamboanga Sibugay', name: 'Zamboanga Sibugay' }
  ],
  'R10': [
    { id: 'Bukidnon', name: 'Bukidnon' },
    { id: 'Camiguin', name: 'Camiguin' },
    { id: 'Lanao del Norte', name: 'Lanao del Norte' },
    { id: 'Misamis Occidental', name: 'Misamis Occidental' },
    { id: 'Misamis Oriental', name: 'Misamis Oriental' }
  ],
  'R11': [
    { id: 'Davao de Oro', name: 'Davao de Oro' },
    { id: 'Davao del Norte', name: 'Davao del Norte' },
    { id: 'Davao del Sur', name: 'Davao del Sur' },
    { id: 'Davao Occidental', name: 'Davao Occidental' },
    { id: 'Davao Oriental', name: 'Davao Oriental' }
  ],
  'R12': [
    { id: 'Cotabato', name: 'Cotabato' },
    { id: 'Sarangani', name: 'Sarangani' },
    { id: 'South Cotabato', name: 'South Cotabato' },
    { id: 'Sultan Kudarat', name: 'Sultan Kudarat' }
  ],
  'R13': [
    { id: 'Agusan del Norte', name: 'Agusan del Norte' },
    { id: 'Agusan del Sur', name: 'Agusan del Sur' },
    { id: 'Dinagat Islands', name: 'Dinagat Islands' },
    { id: 'Surigao del Norte', name: 'Surigao del Norte' },
    { id: 'Surigao del Sur', name: 'Surigao del Sur' }
  ],
  'BARMM': [
    { id: 'Basilan', name: 'Basilan' },
    { id: 'Lanao del Sur', name: 'Lanao del Sur' },
    { id: 'Maguindanao', name: 'Maguindanao' },
    { id: 'Sulu', name: 'Sulu' },
    { id: 'Tawi-Tawi', name: 'Tawi-Tawi' }
  ]
};

export const cities = {
  'Metro Manila': [
    { id: 'Manila', name: 'City of Manila' },
    { id: 'Quezon', name: 'Quezon City' },
    { id: 'Caloocan', name: 'Caloocan City' },
    { id: 'Las Piñas', name: 'Las Piñas City' },
    { id: 'Makati', name: 'Makati City' },
    { id: 'Malabon', name: 'Malabon City' },
    { id: 'Mandaluyong', name: 'Mandaluyong City' },
    { id: 'Marikina', name: 'Marikina City' },
    { id: 'Muntinlupa', name: 'Muntinlupa City' },
    { id: 'Navotas', name: 'Navotas City' },
    { id: 'Parañaque', name: 'Parañaque City' },
    { id: 'Pasay', name: 'Pasay City' },
    { id: 'Pasig', name: 'Pasig City' },
    { id: 'Pateros', name: 'Pateros' },
    { id: 'San Juan', name: 'San Juan City' },
    { id: 'Taguig', name: 'Taguig City' },
    { id: 'Valenzuela', name: 'Valenzuela City' }
  ],
  'Cebu': [
    { id: 'Cebu City', name: 'Cebu City' },
    { id: 'Mandaue', name: 'Mandaue City' },
    { id: 'Lapu-Lapu', name: 'Lapu-Lapu City' },
    { id: 'Talisay', name: 'Talisay City' },
    { id: 'Danao', name: 'Danao City' },
    { id: 'Toledo', name: 'Toledo City' },
    { id: 'Carcar', name: 'Carcar City' },
    { id: 'Naga', name: 'Naga City' },
    { id: 'Bogo', name: 'Bogo City' }
  ],
  'Cavite': [
    { id: 'Bacoor', name: 'Bacoor City' },
    { id: 'Dasmariñas', name: 'Dasmariñas City' },
    { id: 'Imus', name: 'Imus City' },
    { id: 'Tagaytay', name: 'Tagaytay City' },
    { id: 'Trece Martires', name: 'Trece Martires City' },
    { id: 'General Trias', name: 'General Trias City' },
    { id: 'Cavite City', name: 'Cavite City' }
  ],
  'Davao del Sur': [
    { id: 'Davao City', name: 'Davao City' },
    { id: 'Digos', name: 'Digos City' }
  ],
  'Iloilo': [
    { id: 'Iloilo City', name: 'Iloilo City' },
    { id: 'Passi', name: 'Passi City' }
  ],
  'Pampanga': [
    { id: 'Angeles', name: 'Angeles City' },
    { id: 'San Fernando', name: 'San Fernando City' },
    { id: 'Mabalacat', name: 'Mabalacat City' }
  ],
  'Rizal': [
    { id: 'Antipolo', name: 'Antipolo City' },
    { id: 'Cainta', name: 'Cainta' },
    { id: 'Taytay', name: 'Taytay' },
    { id: 'San Mateo', name: 'San Mateo' }
  ],
  'Batangas': [
    { id: 'Batangas City', name: 'Batangas City' },
    { id: 'Lipa', name: 'Lipa City' },
    { id: 'Tanauan', name: 'Tanauan City' }
  ],
  'Laguna': [
    { id: 'Calamba', name: 'Calamba City' },
    { id: 'San Pablo', name: 'San Pablo City' },
    { id: 'Santa Rosa', name: 'Santa Rosa City' },
    { id: 'Biñan', name: 'Biñan City' },
    { id: 'Cabuyao', name: 'Cabuyao City' },
    { id: 'San Pedro', name: 'San Pedro City' }
  ]
};

export const barangays = {
  'Manila': [
    { id: 'Barangay 1', name: 'Barangay 1' },
    { id: 'Barangay 2', name: 'Barangay 2' },
    { id: 'Barangay 3', name: 'Barangay 3' },
    { id: 'Barangay 4', name: 'Barangay 4' },
    { id: 'Barangay 5', name: 'Barangay 5' }
  ],
  'Quezon': [
    { id: 'Barangay Commonwealth', name: 'Commonwealth' },
    { id: 'Barangay Batasan Hills', name: 'Batasan Hills' },
    { id: 'Barangay Holy Spirit', name: 'Holy Spirit' },
    { id: 'Barangay Payatas', name: 'Payatas' },
    { id: 'Barangay Fairview', name: 'Fairview' }
  ],
  'Cebu City': [
    { id: 'Barangay Lahug', name: 'Lahug' },
    { id: 'Barangay Mabolo', name: 'Mabolo' },
    { id: 'Barangay Talamban', name: 'Talamban' },
    { id: 'Barangay Guadalupe', name: 'Guadalupe' },
    { id: 'Barangay Banilad', name: 'Banilad' }
  ],
  'Davao City': [
    { id: 'Barangay Poblacion', name: 'Poblacion District' },
    { id: 'Barangay Talomo', name: 'Talomo District' },
    { id: 'Barangay Buhangin', name: 'Buhangin District' },
    { id: 'Barangay Toril', name: 'Toril District' },
    { id: 'Barangay Bunawan', name: 'Bunawan District' }
  ],
  'Makati': [
    { id: 'Barangay Poblacion', name: 'Poblacion' },
    { id: 'Barangay Bel-Air', name: 'Bel-Air' },
    { id: 'Barangay San Lorenzo', name: 'San Lorenzo' },
    { id: 'Barangay Urdaneta', name: 'Urdaneta' },
    { id: 'Barangay Magallanes', name: 'Magallanes' }
  ],
  'Taguig': [
    { id: 'Barangay Fort Bonifacio', name: 'Fort Bonifacio' },
    { id: 'Barangay Western Bicutan', name: 'Western Bicutan' },
    { id: 'Barangay Upper Bicutan', name: 'Upper Bicutan' },
    { id: 'Barangay Lower Bicutan', name: 'Lower Bicutan' },
    { id: 'Barangay Pinagsama', name: 'Pinagsama' }
  ],
  'Pasig': [
    { id: 'Barangay San Antonio', name: 'San Antonio' },
    { id: 'Barangay Kapitolyo', name: 'Kapitolyo' },
    { id: 'Barangay Oranbo', name: 'Oranbo' },
    { id: 'Barangay Ugong', name: 'Ugong' },
    { id: 'Barangay Pinagbuhatan', name: 'Pinagbuhatan' }
  ]
};

// Zip codes for major cities
export const zipCodes = {
  // Metro Manila
  'Manila': '1000',
  'Quezon': '1100',
  'Makati': '1200',
  'Pasay': '1300',
  'Parañaque': '1700',
  'Pasig': '1600',
  'Taguig': '1630',
  'Mandaluyong': '1550',
  'San Juan': '1500',
  'Caloocan': '1400',
  'Marikina': '1800',
  'Muntinlupa': '1770',
  'Las Piñas': '1740',
  'Valenzuela': '1440',
  'Navotas': '1485',
  'Malabon': '1470',
  'Pateros': '1620',
  
  // Luzon
  'Antipolo': '1870',
  'Bacoor': '4102',
  'Batangas City': '4200',
  'Calamba': '4027',
  'Dasmariñas': '4114',
  'Imus': '4103',
  'San Pablo': '4000',
  'Santa Rosa': '4026',
  'Tagaytay': '4120',
  'Lipa': '4217',
  
  // Visayas
  'Cebu City': '6000',
  'Lapu-Lapu': '6015',
  'Mandaue': '6014',
  'Iloilo City': '5000',
  'Bacolod': '6100',
  'Tacloban': '6500',
  
  // Mindanao
  'Davao City': '8000',
  'Cagayan de Oro': '9000',
  'General Santos': '9500',
  'Zamboanga City': '7000',
  'Iligan': '9200',
  'Butuan': '8600'
};
