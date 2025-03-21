import { useRef, useEffect } from 'react';
import axios from 'axios';

/**
 * Hook to handle Axios request cancellation when component unmounts
 * @returns {Object} Object containing the cancel token source and a cleanup function
 */
const useAxiosCancellation = () => {
  const cancelSourceRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      if (cancelSourceRef.current) {
        cancelSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  const getCancelToken = () => {
    // Cancel previous request if it exists
    if (cancelSourceRef.current) {
      cancelSourceRef.current.cancel('New request initiated');
    }

    // Create new cancel token source
    cancelSourceRef.current = axios.CancelToken.source();
    return cancelSourceRef.current.token;
  };

  return {
    getCancelToken,
    cancelSource: cancelSourceRef.current
  };
};

export default useAxiosCancellation; 