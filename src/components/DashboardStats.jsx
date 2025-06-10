import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement,
  TimeScale
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const StatCard = ({ label, value, highlighted = false, onClick }) => {
  return (
    <div 
      className={`stat-card ${highlighted ? 'highlighted' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        padding: '8px 6px 6px',
        width: '110px',
        height: '80px',
        textAlign: 'center',
        border: highlighted ? '2px solid #1565c0' : '1px solid #e0e0e0',
        boxShadow: 'none',
        margin: '0 4px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div className="stat-label" style={{
        fontSize: '10px',
        fontWeight: 600,
        color: '#333',
        textTransform: 'uppercase',
        width: '100%',
        padding: '2px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '25px',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.2',
      }}>{label === 'Accredited Prepaid' ? 'ACCREDITED\nPREPAID' : label.toUpperCase()}</div>
      <div className="stat-value" style={{
        fontSize: '38px',
        fontWeight: 700,
        lineHeight: 1,
        color: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '45px',
        width: '100%',
      }}>{value}</div>
    </div>
  );
};

const icons = {
  client: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7ZM12 13C7.58 13 4 15.5 4 19V21H20V19C20 15.5 16.42 13 12 13Z" fill="white"/>
    </svg>
  ),
  car: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="white"/>
    </svg>
  ),
  hotel: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 11V3H7v8H3v10h18V11h-4zm-8-6h2v2H9V5zm0 4h2v2H9V9zm4-4h2v2h-2V5zm0 4h2v2h-2V9zm4 0h2v2h-2V9zm0 4h2v2h-2v-2zm-8 0h2v2H9v-2zm4 0h2v2h-2v-2z" fill="white"/>
    </svg>
  ),
  airplane: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="white"/>
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="white"/>
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13h2v7H3v-7zm4-7h2v14H7V6zm4 3h2v11h-2V9zm4 4h2v7h-2v-7zm4-7h2v14h-2V6z" fill="black"/>
    </svg>
  ),
};

// Loading placeholder for stat cards
const LoadingStatCard = () => (
  <div style={{
    backgroundColor: 'white',
    padding: '8px 6px 6px',
    width: '110px',
    height: '80px',
    margin: '0 4px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <div style={{
      height: '25px',
      width: '80%',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
    }}></div>
    <div style={{
      height: '45px',
      width: '60%',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
    }}></div>
  </div>
);

const CategorySection = ({ icon, title, stats, isLoading, onStatClick }) => {
  return (
    <div className="category-section" style={{ 
      marginBottom: '18px',
      display: 'flex', 
      flexDirection: 'column',
    }}>
      <div className="category-header" style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        height: '32px',
      }}>
        <div className="category-icon" style={{
          marginRight: '10px',
          backgroundColor: '#000',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          minWidth: '32px',
          minHeight: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>{icon}</div>
        <div className="category-title" style={{
          fontWeight: 600,
          fontSize: '14px',
          textTransform: 'uppercase',
          color: '#000',
          letterSpacing: '0px',
        }}>{title}</div>
      </div>
      <div className="stat-cards" style={{ 
        display: 'flex', 
        flexWrap: 'nowrap', 
        marginLeft: '-4px', 
        marginRight: '-4px',
        height: '80px',
        alignItems: 'center',
      }}>
        {isLoading ? (
          Array(4).fill(0).map((_, index) => <LoadingStatCard key={index} />)
        ) : (
          stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              highlighted={stat.highlighted}
              onClick={() => onStatClick(title, index)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Mock API service (replace with actual API calls)
const fetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        registeredClient: [
          { label: 'NCR', value: '29', highlighted: false },
          { label: 'LUZON', value: '32', highlighted: true },
          { label: 'VISAYAS', value: '1', highlighted: false },
          { label: 'MINDANAO', value: '5', highlighted: false },
        ],
        landTransportation: [
          { label: 'Accredited', value: '34', highlighted: true },
          { label: 'Accredited Prepaid', value: '23', highlighted: false },
          { label: 'Disaccredites', value: '2', highlighted: false },
        ],
        hotels: [
          { label: 'Accredited', value: '1096', highlighted: false },
          { label: 'Accredited Prepaid', value: '1765', highlighted: true },
          { label: 'Non-Accredited Airbnb/Inn', value: '208', highlighted: false },
          { label: 'Non-Accredited', value: '386', highlighted: false },
        ],
        airlines: [
          { label: 'Accredited', value: '10', highlighted: true },
        ],
        travelOperator: [
          { label: 'Accredited', value: '10', highlighted: true },
        ],
      });
    }, 1500); // Simulate network delay
  });
};

// Mock API service for trend data
const fetchTrendData = (period = 'month') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate dates for the last period (day, week, month, year)
      let dates = [];
      const today = new Date();
      
      if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
          dates.push(format(subDays(today, i), 'MMM dd'));
        }
      } else if (period === 'month') {
        for (let i = 29; i >= 0; i -= 4) {
          dates.push(format(subDays(today, i), 'MMM dd'));
        }
      } else if (period === 'year') {
        for (let i = 11; i >= 0; i--) {
          dates.push(format(subMonths(today, i), 'MMM yyyy'));
        }
      }
      
      // Generate random data for each category
      const randomData = (min, max, length) => {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
      };
      
      resolve({
        labels: dates,
        datasets: [
          {
            label: 'Client Registrations',
            data: randomData(10, 50, dates.length),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Hotel Bookings',
            data: randomData(100, 200, dates.length),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Transport Bookings',
            data: randomData(20, 40, dates.length),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'Airline Bookings',
            data: randomData(5, 15, dates.length),
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
          },
        ],
      });
    }, 1000);
  });
};

const TrendChart = ({ isLoading, period, setPeriod, chartType, setChartType, chartData }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(0,0,0,0.1)',
            borderTopColor: '#1565c0',
            animation: 'spin 1s linear infinite',
          }}></div>
        </div>
      );
    }
    
    return (
      <div style={{ height: '300px', width: '100%' }}>
        {chartType === 'line' ? (
          <Line options={chartOptions} data={chartData} />
        ) : (
          <Bar options={chartOptions} data={chartData} />
        )}
      </div>
    );
  };

  return (
    <div className="trend-chart" style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '10px' }}>{icons.chart}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setChartType('line')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: chartType === 'line' ? '#1565c0' : '#f5f5f5',
                color: chartType === 'line' ? 'white' : '#333',
                cursor: 'pointer',
              }}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: chartType === 'bar' ? '#1565c0' : '#f5f5f5',
                color: chartType === 'bar' ? 'white' : '#333',
                cursor: 'pointer',
              }}
            >
              Bar
            </button>
          </div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0',
              background: '#f5f5f5',
              cursor: 'pointer',
            }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      {renderChart()}
    </div>
  );
};

const DashboardStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    registeredClient: [],
    landTransportation: [],
    hotels: [],
    airlines: [],
    travelOperator: []
  });
  const [error, setError] = useState(null);
  
  // Chart state
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('month');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardData();
        setStatsData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        // Error fetching dashboard data
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setChartLoading(true);
        const data = await fetchTrendData(chartPeriod);
        setChartData(data);
      } catch (error) {
        // Error fetching trend data
        console.error("Error fetching trend data:", error);
      } finally {
        setChartLoading(false);
      }
    };
    
    loadTrendData();
  }, [chartPeriod]);

  const refreshData = () => {
    setIsLoading(true);
    setChartLoading(true);
    
    Promise.all([
      fetchDashboardData(),
      fetchTrendData(chartPeriod)
    ])
    .then(([dashData, trendData]) => {
      setStatsData(dashData);
      setChartData(trendData);
      setError(null);
    })
    .catch(error => {
      setError('Failed to refresh data. Please try again.');
      console.error("Error refreshing data:", error);
    })
    .finally(() => {
      setIsLoading(false);
      setChartLoading(false);
    });
  };

  const handleStatClick = (category, index) => {
    // Create a deep copy of the current state
    const updatedStats = { ...statsData };
    
    // Get the correct category array
    const categoryKey = category === 'REGISTERED CLIENT' ? 'registeredClient' :
                       category === 'LAND TRANSPORTATION' ? 'landTransportation' :
                       category === 'HOTELS' ? 'hotels' :
                       category === 'AIRLINES' ? 'airlines' : 'travelOperator';
    
    // Toggle highlighted status for the clicked stat
    updatedStats[categoryKey] = updatedStats[categoryKey].map((stat, i) => ({
      ...stat,
      highlighted: i === index ? !stat.highlighted : stat.highlighted
    }));
    
    setStatsData(updatedStats);
  };

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fdf3f3', color: '#d32f2f', borderRadius: '4px' }}>
        <p>{error}</p>
        <button 
          onClick={refreshData}
          style={{
            backgroundColor: '#1565c0',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div className="dashboard-stats" style={{
        backgroundColor: '#ededed',
        padding: '20px 18px',
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        width: '100%',
        position: 'relative',
        marginBottom: '25px',
      }}>
        <div className="stats-row" style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
        }}>
          <CategorySection
            icon={icons.client}
            title="REGISTERED CLIENT"
            stats={statsData.registeredClient}
            isLoading={isLoading}
            onStatClick={handleStatClick}
          />
          <CategorySection
            icon={icons.car}
            title="LAND TRANSPORTATION"
            stats={statsData.landTransportation}
            isLoading={isLoading}
            onStatClick={handleStatClick}
          />
        </div>
        <div className="stats-row" style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
        }}>
          <div style={{ flex: '0 0 auto', marginRight: '45px' }}>
            <CategorySection
              icon={icons.hotel}
              title="HOTELS"
              stats={statsData.hotels}
              isLoading={isLoading}
              onStatClick={handleStatClick}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            gap: '45px',
            flexGrow: 1,
          }}>
            <CategorySection
              icon={icons.airplane}
              title="AIRLINES"
              stats={statsData.airlines}
              isLoading={isLoading}
              onStatClick={handleStatClick}
            />
            <CategorySection
              icon={icons.airplane}
              title="TRAVEL OPERATOR"
              stats={statsData.travelOperator}
              isLoading={isLoading}
              onStatClick={handleStatClick}
            />
          </div>
        </div>
        
        <button 
          onClick={refreshData} 
          disabled={isLoading}
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            width: '28px',
            height: '28px',
            backgroundColor: '#1565c0',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            padding: 0,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
          }}
          title="Refresh data"
        >
          {isLoading ? (
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderTop: '2px solid white',
                        animation: 'spin 1s linear infinite' }} />
          ) : icons.refresh}
        </button>
      </div>
      
      <TrendChart 
        isLoading={chartLoading}
        period={chartPeriod}
        setPeriod={setChartPeriod}
        chartType={chartType}
        setChartType={setChartType}
        chartData={chartData}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardStats;