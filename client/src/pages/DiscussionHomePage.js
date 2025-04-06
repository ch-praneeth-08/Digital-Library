// // src/pages/DiscussionHomePage.js
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import './DiscussionHomePage.css'; // Create CSS

// function DiscussionHomePage() {
//     const [categories, setCategories] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');

//     const fetchCategories = useCallback(async () => {
//         setIsLoading(true);
//         setError('');
//         const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
//         // **CONFIRM ENDPOINT** - Assuming endpoint returns array of category strings
//         const categoriesUrl = `${backendUrl}/api/categories/distinct`; // Example endpoint

//         try {
//             const response = await axios.get(categoriesUrl);
//             // **CONFIRM RESPONSE STRUCTURE** - Assuming response.data.data is the array of strings
//             if (response.data && response.data.success && Array.isArray(response.data.data)) {
//                 const sortedCategories = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
//                 setCategories(sortedCategories); // Sort categories alphabetically
//             } else {
//                 console.error("Unexpected response:", response.data);
//                 // Fallback to hardcoded if fetch fails or is not implemented
//                 // setCategories(["Artificial Intelligence", "Computer Science", "Physics", "Quantum Physics"]);
//                 setError("Failed to fetch discussion categories.");
//                 setCategories([]);
//             }
//         } catch (err) {
//             console.error('Error fetching categories:', err);
//              // Fallback to hardcoded on error
//             // setCategories(["Artificial Intelligence", "Computer Science", "Physics", "Quantum Physics"]);
//             setError(err.response?.data?.message || 'Could not load discussion categories.');
//             setCategories([]);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchCategories();
//     }, [fetchCategories]);

//     return (
//         <div className="discussion-home-container">
//             <h2>Discussion Forums</h2>
//             <p>Select a category to view discussion topics.</p>

//             {isLoading && <p>Loading categories...</p>}
//             {error && <p className="error-message">{error}</p>}

//             {!isLoading && !error && (
//                 <ul className="category-list">
//                     {categories.length === 0 ? (
//                         <p>No discussion categories available yet.</p>
//                     ) : (
//                         categories.map(category => (
//                             <li key={category} className="category-item">
//                                 {/* Link to the page showing topics for this category */}
//                                 {/* Encode category name for URL safety */}
//                                 <Link to={`/discussions/category/${encodeURIComponent(category.name)}`}>
//                                     {category.name}
//                                     {/* Optionally display description */}
//                                     {category.description && <span className="category-description">{category.description}</span>}
//                                 </Link>
//                                 {/* Optionally show topic count/last post here later */}
//                             </li>
//                         ))
//                     )}
//                 </ul>
//             )}
//         </div>
//     );
// }

// export default DiscussionHomePage;