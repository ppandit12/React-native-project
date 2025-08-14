import { useCallback, useState } from "react";
import { Alert } from "react-native";

const API_URL = "";
// const API_URL = "http://localhost:5001/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // New: Track errors for UI display

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
      if (!response.ok) {
        const errorText = await response.text(); // Get raw text for debugging
        throw new Error(`Transactions fetch failed (status ${response.status}): ${errorText}`);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.message); // Store error
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Summary fetch failed (status ${response.status}): ${errorText}`);
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(error.message);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null); // Reset error on reload
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  // New: Function to add a transaction (POST request)
  const addTransaction = async (newTransaction) => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId, // Include userId in the body
          ...newTransaction, // Spread the new expense data (e.g., { category, amount, description, title, date })
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add transaction (status ${response.status}): ${errorText}`);
      }
      // Optional: Parse response if needed (e.g., to get the new transaction ID)
      const addedData = await response.json();
      console.log("Transaction added:", addedData);

      // Refresh data after adding
      loadData();
      Alert.alert("Success", "Expense added successfully");
    } catch (error) {
      console.error("Error adding expense:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete transaction (status ${response.status}): ${errorText}`);
      }

      // Refresh data after deletion
      loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction, addTransaction, error };
};
