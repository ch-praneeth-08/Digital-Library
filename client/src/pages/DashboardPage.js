// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import './DashboardPage.css';

function DashboardPage() {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for the search input
  const [currentSearch, setCurrentSearch] = useState(''); // State to hold the active search term for fetching

  // Helper function (keep from previous step)
  const cleanString = (str) => { /* ... */ };

  // --- Updated fetchMaterials function ---
  // Use useCallback to memoize the function, preventing unnecessary re-creation
  // unless its dependencies (backendUrl) change. Useful if passed to child components later.
  const fetchMaterials = useCallback(async (keyword = '') => { // Accept keyword, default to empty
    setIsLoading(true);
    setError('');
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    // Construct the URL with the keyword parameter if present
    let materialsUrl = `${backendUrl}/api/materials`;
    const params = new URLSearchParams(); // Use URLSearchParams for clean parameter handling
    if (keyword) {
      params.append('keyword', keyword); // Add keyword param if not empty
    }
    // TODO: Add params for filters (category, year, etc.) and pagination (page, limit) later
    // params.append('limit', '10'); // Example: set a limit

    const queryString = params.toString();
    if (queryString) {
        materialsUrl += `?${queryString}`;
    }

    console.log("Fetching URL:", materialsUrl); // Log the URL being fetched

    try {
      const response = await axios.get(materialsUrl);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setMaterials(response.data.data);
        // TODO: Store pagination data later: setPaginationInfo(response.data.pagination);
      } else {
        console.error("Unexpected response structure:", response.data);
        setMaterials([]);
        setError(response.data?.message || "Received invalid data format from server.");
      }

    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.response?.data?.message || 'Failed to fetch materials.');
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback dependency array, currently empty as backendUrl is stable in this context

  // --- Effect for initial load ---
  useEffect(() => {
    fetchMaterials(); // Fetch all materials initially (keyword is default empty string)
  }, [fetchMaterials]); // Depend on the memoized fetchMaterials function

  // --- Effect to re-fetch when currentSearch changes ---
  // This effect runs whenever the user *commits* to a search term
  useEffect(() => {
      // Fetch materials based on the current committed search term.
      // The initial load is handled by the effect above.
      // This prevents fetching on every keystroke if the user clears the search.
      fetchMaterials(currentSearch);
  }, [currentSearch, fetchMaterials]); // Re-run if the committed search or fetch function changes

  // --- Handler for search input change ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // --- Handler for submitting the search ---
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent form submission page reload
    setCurrentSearch(searchTerm); // Commit the search term to trigger the fetch effect
  };

   // --- Handler to clear search ---
   const clearSearch = () => {
      setSearchTerm('');
      setCurrentSearch(''); // Commit empty search to trigger fetch effect for all items
   };


  // --- Render Logic ---
  return (
    <div className="dashboard-container">
      <h2>Dashboard - Academic Materials</h2>

      {/* --- Search Form --- */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
         {/* Add a clear button only if there's an active search */}
         {currentSearch && (
             <button type="button" onClick={clearSearch} className="clear-button">Clear</button>
         )}
      </form>
      {/* --- End Search Form --- */}


      {isLoading && <p>Loading materials...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <div className="materials-list">
           {/* Inform user if search yielded no results */}
           {!isLoading && materials.length === 0 && currentSearch && (
               <p>No materials found matching "{currentSearch}".</p>
           )}
           {/* Inform user if no materials exist at all (and no search active) */}
           {!isLoading && materials.length === 0 && !currentSearch && (
               <p>No materials available in the library yet.</p>
           )}

          {materials.map((material) => {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const fileUrl = `${backendUrl}/${material.filePath}`;
            return (
              <div key={material._id} className="material-item">
                {/* ... (material details rendering as before) ... */}
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

// Don't forget the cleanString helper if you haven't added it yet
const cleanString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/^"|"$/g, '').replace(/\\"/g, '"');
};

export default DashboardPage;