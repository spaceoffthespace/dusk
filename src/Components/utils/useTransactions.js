import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTransactions = (authTokens) => {

    const apiUrl = process.env.REACT_APP_API_URL;

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/transactions/`, {
                headers: {
                    'Authorization': `Bearer ${authTokens.access}`,
                }
            });
            const sortedTransactions = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(sortedTransactions);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return { transactions, loading, error, fetchTransactions };
};