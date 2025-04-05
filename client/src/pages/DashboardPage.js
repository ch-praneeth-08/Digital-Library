// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './DashboardPage.css';

// Define known types and categories (ideally fetch categories from backend later)
const materialTypes = [
    { value: 'research_paper', label: 'Research Paper' },
    { value: 'book', label: 'Book' },
    { value: 'course_material', label: 'Course Material' },
    { value: 'thesis', label: 'Thesis' },
    // Add others if applicable
];
const categories = [
    "Artificial Intelligence",
    "Computer Science",
    "Physics",
    "Quantum Physics",
    // Add others or fetch dynamically
];


function DashboardPage() {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  // --- Filter State ---
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // --- Active Filters State (to trigger fetch) ---
  // We use separate state for active filters so fetch isn't triggered on every input change,
  // only when 'Apply Filters' is clicked.
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    year: '',
    type: '',
    keyword: '' // Include keyword search here too
  });

  // --- Helper function ---
  const cleanString = (str) => { /* ... */ }; // Keep from previous steps

  // --- Updated fetchMaterials function ---
  const fetchMaterials = useCallback(async (filters) => {
    setIsLoading(true);
    setError('');
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    let materialsUrl = `${backendUrl}/api/materials`;
    const params = new URLSearchParams();

    // Append parameters ONLY if they have a value in the active filters
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.category) params.append('category', filters.category);
    if (filters.year) params.append('publicationYear', filters.year); // Ensure backend expects 'publicationYear'
    if (filters.type) params.append('materialType', filters.type); // Ensure backend expects 'materialType'

    // Add pagination params later if needed: params.append('page', filters.page || 1); params.append('limit', filters.limit || 10);

    const queryString = params.toString();
    if (queryString) {
        materialsUrl += `?${queryString}`;
    }

    console.log("Fetching URL:", materialsUrl); // Log the URL being fetched

    try {
      const response = await axios.get(materialsUrl);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setMaterials(response.data.data);
        // Store pagination: setPaginationInfo(response.data.pagination);
      } else { /* ... error handling ... */ }
    } catch (err) { /* ... error handling ... */ }
    finally { setIsLoading(false); }
  }, []); // Dependency array for useCallback

  // --- Effect to fetch data whenever activeFilters change ---
  useEffect(() => {
    console.log("Active filters changed, fetching:", activeFilters);
    fetchMaterials(activeFilters);
  }, [activeFilters, fetchMaterials]); // Re-run when active filters change

  // --- Handlers ---
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleCategoryChange = (event) => setSelectedCategory(event.target.value);
  const handleYearChange = (event) => setSelectedYear(event.target.value);
  const handleTypeChange = (event) => setSelectedType(event.target.value);

  // --- Apply Search and Filters ---
  const handleApplySearchAndFilters = (event) => {
      event?.preventDefault(); // Prevent default if called from form submit
      setActiveFilters({
          keyword: searchTerm,
          category: selectedCategory,
          year: selectedYear,
          type: selectedType
      });
  };

  // --- Clear Search and Filters ---
  const handleClearSearchAndFilters = () => {
      setSearchTerm('');
      setSelectedCategory('');
      setSelectedYear('');
      setSelectedType('');
      // Trigger fetch with empty filters
      setActiveFilters({ keyword: '', category: '', year: '', type: '' });
  };


  // --- Render Logic ---
  return (
    <div className="dashboard-container">
      <h2>Dashboard - Academic Materials</h2>

      {/* --- Search and Filter Form --- */}
      <form onSubmit={handleApplySearchAndFilters} className="search-filter-form">
        {/* Keyword Search */}
        <div className="form-row">
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input form-control"
            />
        </div>

        {/* Filter Controls */}
        <div className="form-row filter-controls">
            {/* Category Dropdown */}
            <select value={selectedCategory} onChange={handleCategoryChange} className="filter-select form-control">
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {/* Year Input */}
            <input
              type="number"
              placeholder="Year (e.g., 2023)"
              value={selectedYear}
              onChange={handleYearChange}
              className="filter-input form-control"
              min="1900" // Optional: set min/max year
              max={new Date().getFullYear()} // Optional: current year as max
            />

            {/* Type Dropdown */}
            <select value={selectedType} onChange={handleTypeChange} className="filter-select form-control">
                <option value="">All Types</option>
                {materialTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
        </div>

         {/* Action Buttons */}
        <div className="form-row action-buttons">
            <button type="submit" className="btn btn-primary">Apply Filters</button>
            <button type="button" onClick={handleClearSearchAndFilters} className="btn btn-secondary">Clear All</button>
        </div>
      </form>
      {/* --- End Search and Filter Form --- */}


      {/* --- Results Display --- */}
      {isLoading && <p>Loading materials...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <div className="materials-list">
            {/* ... No results messages ... */}
            {materials.length === 0 && (activeFilters.keyword || activeFilters.category || activeFilters.year || activeFilters.type) && (
                 <p>No materials found matching your criteria.</p>
            )}
             {!isLoading && materials.length === 0 && !(activeFilters.keyword || activeFilters.category || activeFilters.year || activeFilters.type) && (
                 <p>No materials available in the library yet.</p>
            )}

           {materials.map((material) => {
                // ... (material item rendering as before - no changes needed here) ...
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const fileUrl = `${backendUrl}/${material.filePath}`;
                return (
                  <div key={material._id} className="material-item">
                     <h3>{material.title}</h3>
                     <p><strong>Authors:</strong> {material.authors?.map(cleanString).join(', ') || 'N/A'}</p>
                     <p><strong>Year:</strong> {material.publicationYear || 'N/A'}</p>
                     <p><strong>Type:</strong> {material.materialType ? material.materialType.replace('_', ' ') : 'N/A'}</p>
                     <p><strong>Category:</strong> {material.category || 'N/A'}</p>
                     <p><strong>Description:</strong> {material.description || 'N/A'}</p>
                     <p><strong>Keywords:</strong> {material.keywords?.map(cleanString).join(', ') || 'None'}</p>
                     {material.filePath && material.fileName && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="material-download-link">
                            View/Download ({material.fileName})
                        </a>
                     )}
                  </div>
                );
           })}
        </div>
      )}
       {/* TODO: Add Pagination controls here later */}
    </div>
  );
}

// Don't forget helper functions if not already present
const cleanString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/^"|"$/g, '').replace(/\\"/g, '"');
};


export default DashboardPage;