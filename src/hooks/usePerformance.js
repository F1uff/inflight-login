import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName) => {
    const [metrics, setMetrics] = useState({
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        totalRenderTime: 0
    });

    useEffect(() => {
        const startTime = performance.now();
        setMetrics(prev => ({
            ...prev,
            renderCount: prev.renderCount + 1
        }));

        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            setMetrics(prev => {
                const newTotalTime = prev.totalRenderTime + renderTime;
                const newAverageTime = newTotalTime / prev.renderCount;
                
                return {
                    ...prev,
                    lastRenderTime: renderTime,
                    averageRenderTime: newAverageTime,
                    totalRenderTime: newTotalTime
                };
            });
        };
    }, [componentName]);

    return metrics;
};

// Optimized fetch hook with caching
export const useOptimizedFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Simple in-memory cache
    const cache = useMemo(() => new Map(), []);
    
    const fetchData = useCallback(async () => {
        if (!url) return;

        // Check cache first
        const cacheKey = `${url}${JSON.stringify(options)}`;
        if (cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < (options.cacheTime || 300000)) { // 5 min default
                setData(cachedData.data);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            // Cache the result
            cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url, options, cache]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// Debounced search hook
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );
    
    const visibleItems = items.slice(visibleStart, visibleEnd);
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleStart * itemHeight;

    return {
        visibleItems,
        totalHeight,
        offsetY,
        onScroll: (e) => setScrollTop(e.target.scrollTop)
    };
};

// Performance measurement utilities
export const measurePerformance = (name, fn) => {
    return async (...args) => {
        const start = performance.now();
        const result = await fn(...args);
        const end = performance.now();
        
        if (typeof window !== 'undefined' && window.console) {
            console.log(`${name} took ${end - start} milliseconds`);
        }
        
        return result;
    };
};

// Memory usage monitoring
export const useMemoryMonitoring = () => {
    const [memoryInfo, setMemoryInfo] = useState(null);

    useEffect(() => {
        const updateMemoryInfo = () => {
            if ('memory' in performance) {
                setMemoryInfo({
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                });
            }
        };

        updateMemoryInfo();
        const interval = setInterval(updateMemoryInfo, 5000);
        
        return () => clearInterval(interval);
    }, []);

    return memoryInfo;
};

// React DevTools profiler wrapper
export const ProfilerWrapper = ({ id, children, onRender }) => {
    const handleRender = useCallback((id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
        if (onRender) {
            onRender({ id, phase, actualDuration, baseDuration, startTime, commitTime, interactions });
        }
    }, [onRender]);

    return (
        <React.Profiler id={id} onRender={handleRender}>
            {children}
        </React.Profiler>
    );
};

export default {
    usePerformanceMonitoring,
    useOptimizedFetch,
    useDebounce,
    useVirtualScroll,
    measurePerformance,
    useMemoryMonitoring,
    ProfilerWrapper
}; 