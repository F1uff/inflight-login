const { initializeDatabase, getConnection } = require('../config/database');

async function addSampleSuppliers() {
    try {
        // Initialize the database connection first
        await initializeDatabase();
        const pool = getConnection();
        
        console.log('🔧 Adding sample suppliers for testing statistics...');
        
        // First, add sample companies with different accreditation statuses and regions
        const companies = [
            // NCR & Luzon - Accredited
            { name: 'Manila Transport Co.', city: 'Manila', state: 'NCR', accreditation_status: 'accredited' },
            { name: 'Makati Logistics Inc.', city: 'Makati', state: 'Metro Manila', accreditation_status: 'accredited' },
            { name: 'Quezon City Tours', city: 'Quezon City', state: 'NCR', accreditation_status: 'accredited' },
            { name: 'Rizal Transport Service', city: 'Antipolo', state: 'Rizal', accreditation_status: 'accredited' },
            { name: 'Bulacan Express', city: 'Malolos', state: 'Bulacan', accreditation_status: 'accredited' },
            
            // NCR & Luzon - Non-accredited
            { name: 'Cavite Van Rental', city: 'Imus', state: 'Cavite', accreditation_status: 'none' },
            { name: 'Laguna Tours', city: 'Santa Rosa', state: 'Laguna', accreditation_status: 'pending' },
            
            // Visayas - Accredited
            { name: 'Cebu City Transport', city: 'Cebu City', state: 'Cebu', accreditation_status: 'accredited' },
            { name: 'Iloilo Logistics', city: 'Iloilo City', state: 'Iloilo', accreditation_status: 'accredited' },
            { name: 'Boracay Tours', city: 'Boracay', state: 'Aklan', accreditation_status: 'accredited' },
            { name: 'Bacolod Express', city: 'Bacolod', state: 'Negros Occidental', accreditation_status: 'accredited' },
            
            // Visayas - Non-accredited  
            { name: 'Bohol Tours', city: 'Tagbilaran', state: 'Bohol', accreditation_status: 'none' },
            
            // Mindanao - Accredited
            { name: 'Davao City Transport', city: 'Davao City', state: 'Davao Del Sur', accreditation_status: 'accredited' },
            { name: 'Cagayan de Oro Logistics', city: 'Cagayan de Oro', state: 'Misamis Oriental', accreditation_status: 'accredited' },
            { name: 'Zamboanga Express', city: 'Zamboanga City', state: 'Zamboanga Del Sur', accreditation_status: 'accredited' },
            
            // Mindanao - Non-accredited
            { name: 'Butuan Tours', city: 'Butuan', state: 'Agusan Del Norte', accreditation_status: 'none' }
        ];
        
        console.log('📊 Inserting sample companies...');
        for (const company of companies) {
            const companyQuery = `
                INSERT INTO companies (name, city, state, accreditation_status, status, email, phone, business_type)
                VALUES ($1, $2, $3, $4, 'active', $5, $6, 'Transport')
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            `;
            
            const email = `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
            const phone = '+63' + Math.floor(Math.random() * 900000000 + 100000000);
            
            const result = await pool.query(companyQuery, [
                company.name,
                company.city,
                company.state,
                company.accreditation_status,
                email,
                phone
            ]);
            
            if (result.rows.length > 0) {
                const companyId = result.rows[0].id;
                
                // Add a supplier for each company
                const supplierQuery = `
                    INSERT INTO suppliers (
                        company_id, 
                        supplier_code, 
                        supplier_type, 
                        service_categories, 
                        account_status,
                        overall_rating,
                        total_trips_completed,
                        total_revenue_generated
                    )
                    VALUES ($1, $2, 'transport', $3, $4, $5, $6, $7)
                    ON CONFLICT (supplier_code) DO NOTHING
                `;
                
                const supplierCode = 'SUP' + String(Date.now() + Math.floor(Math.random() * 1000)).slice(-8);
                const serviceCategories = ['airport_transfer', 'city_tour'];
                const accountStatus = company.accreditation_status === 'accredited' ? 'active' : 'pending_approval';
                const rating = Math.random() * 2 + 3; // 3.0 to 5.0
                const trips = Math.floor(Math.random() * 500 + 50);
                const revenue = Math.random() * 100000 + 10000;
                
                await pool.query(supplierQuery, [
                    companyId,
                    supplierCode,
                    serviceCategories,
                    accountStatus,
                    rating.toFixed(2),
                    trips,
                    revenue.toFixed(2)
                ]);
                
                console.log(`✅ Added: ${company.name} (${company.city}, ${company.state}) - ${company.accreditation_status}`);
            }
        }
        
        // Show summary statistics
        const statsQuery = `
            SELECT 
                COUNT(CASE WHEN c.accreditation_status = 'accredited' THEN 1 END) as accredited,
                COUNT(CASE WHEN c.accreditation_status = 'accredited' AND s.account_status = 'active' THEN 1 END) as accredited_prepaid,
                COUNT(CASE WHEN c.accreditation_status IN ('none', 'expired', 'pending') THEN 1 END) as non_accredited,
                COUNT(CASE 
                    WHEN UPPER(c.city) IN ('MANILA', 'QUEZON CITY', 'MAKATI', 'PASIG', 'TAGUIG', 'MANDALUYONG', 'CALOOCAN', 'LAS PIÑAS', 'MARIKINA', 'MUNTINLUPA', 'NAVOTAS', 'PARAÑAQUE', 'PASAY', 'PATEROS', 'SAN JUAN', 'VALENZUELA', 'MALABON')
                         OR UPPER(c.state) IN ('NCR', 'METRO MANILA', 'NATIONAL CAPITAL REGION')
                         OR UPPER(c.city) LIKE '%MANILA%'
                         OR UPPER(c.city) IN ('ANTIPOLO', 'CAINTA', 'MARIKINA', 'SAN MATEO', 'TAYTAY')
                         OR UPPER(c.state) IN ('RIZAL', 'BULACAN', 'CAVITE', 'LAGUNA', 'BATANGAS', 'PAMPANGA', 'NUEVA ECIJA', 'TARLAC', 'ZAMBALES', 'BATAAN', 'AURORA', 'QUEZON')
                    THEN 1 END) as ncr_luzon,
                COUNT(CASE 
                    WHEN UPPER(c.state) IN ('AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL', 'ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON', 'BOHOL', 'CEBU', 'NEGROS ORIENTAL', 'SIQUIJOR', 'BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR', 'SOUTHERN LEYTE')
                         OR UPPER(c.city) IN ('CEBU CITY', 'ILOILO CITY', 'BACOLOD', 'TACLOBAN', 'DUMAGUETE', 'TAGBILARAN', 'ROXAS CITY', 'KALIBO', 'BORACAY')
                         OR UPPER(c.city) LIKE '%CEBU%'
                         OR UPPER(c.city) LIKE '%ILOILO%'
                         OR UPPER(c.city) LIKE '%BOHOL%'
                    THEN 1 END) as visayas,
                COUNT(CASE 
                    WHEN UPPER(c.state) IN ('ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY', 'BASILAN', 'LANAO DEL NORTE', 'LANAO DEL SUR', 'MAGUINDANAO', 'NORTH COTABATO', 'SARANGANI', 'SOUTH COTABATO', 'SULTAN KUDARAT', 'SULU', 'TAWI-TAWI', 'AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR', 'CAMIGUIN', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL', 'BUKIDNON', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO OCCIDENTAL', 'DAVAO ORIENTAL', 'COMPOSTELA VALLEY')
                         OR UPPER(c.city) IN ('DAVAO CITY', 'CAGAYAN DE ORO', 'ZAMBOANGA CITY', 'BUTUAN', 'ILIGAN', 'COTABATO CITY', 'MARAWI', 'PAGADIAN', 'MALAYBALAY', 'SURIGAO CITY', 'TANDAG', 'BISLIG', 'KIDAPAWAN')
                         OR UPPER(c.city) LIKE '%DAVAO%'
                         OR UPPER(c.city) LIKE '%MINDANAO%'
                    THEN 1 END) as mindanao
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            WHERE s.account_status IN ('active', 'pending_approval')
        `;
        
        const statsResult = await pool.query(statsQuery);
        const stats = statsResult.rows[0];
        
        console.log('\n📈 SUPPLIER STATISTICS:');
        console.log('='.repeat(50));
        console.log('🔵 ACCREDITED:', stats.accredited);
        console.log('🟠 ACCREDITED PREPAID:', stats.accredited_prepaid);
        console.log('🔴 NON-ACCREDITED:', stats.non_accredited);
        console.log('📍 NCR & LUZON:', stats.ncr_luzon);
        console.log('🌴 VISAYAS:', stats.visayas);
        console.log('🏔️  MINDANAO:', stats.mindanao);
        console.log('='.repeat(50));
        
        console.log('\n✅ Sample supplier data added successfully!');
        console.log('📊 You can now test the supplier statistics in the admin dashboard.');
        
    } catch (error) {
        console.error('❌ Error adding sample suppliers:', error);
        throw error;
    }
}

// Run the script if called directly
if (require.main === module) {
    addSampleSuppliers()
        .then(() => {
            console.log('🎉 Script completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { addSampleSuppliers }; 