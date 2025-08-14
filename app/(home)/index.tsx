import SignOutButton from '../components/SignOutButton';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, Modal } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../../assets/styles/home.styles'; 
import { COLORS } from '@/constants/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// New separate component for adding income (as a modal content)
const AddIncome = ({ onAddIncome, onClose }) => {
  const [incomeAmount, setIncomeAmount] = useState('');

  const handleSubmit = () => {
    if (!incomeAmount) return;
    onAddIncome(parseFloat(incomeAmount));
    setIncomeAmount('');
    onClose(); // Close modal after adding
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View style={{ backgroundColor: COLORS.white || '#fff', padding: 20, borderRadius: 12, width: '80%', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Add Income</Text>
        <TextInput
          placeholder="Enter amount (e.g., 100.00)"
          value={incomeAmount}
          onChangeText={setIncomeAmount}
          keyboardType="numeric"
          style={{ backgroundColor: COLORS.card, borderRadius: 8, padding: 12, marginBottom: 12, width: '100%' }}
        />
        <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: COLORS.primary, borderRadius: 8, padding: 12, width: '100%', alignItems: 'center' }}>
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>Submit Income</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Page() {
  const { user } = useUser();

  const [transactions, setTransactions] = useState([]); // Local state for transactions (like TODO items)
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Optional: Simulate loading if needed
  const [error, setError] = useState(null);
  const [showIncomeModal, setShowIncomeModal] = useState(false); // State to control income modal

  // Compute summary locally from transactions
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    });
    return {
      balance: totalIncome - totalExpenses,
      income: totalIncome,
      expenses: totalExpenses,
    };
  }, [transactions]);

  const handleAddExpense = () => {
    if (!amount) {
      setError('Amount is required');
      return;
    }
    const newExpense = {
      id: Date.now().toString(), // Unique ID (like TODO apps)
      category,
      amount: parseFloat(amount), // Convert to number
      description,
      title: description || `${category} Expense`, // Use description as title or fallback
      date: new Date().toISOString().split('T')[0], // Add current date (YYYY-MM-DD)
      type: 'expense', // Mark as expense
    };
    setTransactions([...transactions, newExpense]); // Add to local state
    setAmount('');
    setDescription('');
    setError(null); // Clear any errors
  };

  const handleAddIncome = (incomeAmount) => {
    const newIncome = {
      id: Date.now().toString(),
      category: 'Income', // Fixed category for income
      amount: incomeAmount,
      description: 'Added Income',
      title: 'Income',
      date: new Date().toISOString().split('T')[0],
      type: 'income', // Mark as income
    };
    setTransactions([...transactions, newIncome]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((tx) => tx.id !== id)); // Remove from local state
  };

  const categories = ['Food', 'Stationary', 'Transport', 'Entertainment', 'Utilities', 'Other'];
  const username = user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={styles.container}>
        <SignedIn>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Image 
                  source={{
                    uri: "https://images.unsplash.com/photo-1754898284154-62daf743b909?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }} style={styles.headerLogo} />
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.usernameText}>{username}</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowIncomeModal(true)}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton}>
                  <SignOutButton />
                </TouchableOpacity>
              </View>
            </View>

            {/* Income Modal */}
            <Modal
              visible={showIncomeModal}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowIncomeModal(false)}
            >
              <AddIncome onAddIncome={handleAddIncome} onClose={() => setShowIncomeModal(false)} />
            </Modal>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceTitle}>Total Balance</Text>
              <Text style={styles.balanceAmount}>${summary?.balance?.toFixed(2) || '0.00'}</Text>
              <View style={styles.balanceStats}>
                <View style={[styles.balanceStatItem, styles.statDivider]}>
                  <Text style={styles.balanceStatLabel}>Income</Text>
                  <Text style={styles.balanceStatAmount}>${summary?.income?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.balanceStatItem}>
                  <Text style={styles.balanceStatLabel}>Expenses</Text>
                  <Text style={styles.balanceStatAmount}>${summary?.expenses?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Add New Expense</Text>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={{ backgroundColor: COLORS.card, borderRadius: 8, padding: 12, marginBottom: 12 }} // Basic fallback
            >
              {categories.map((cat) => <Picker.Item key={cat} label={cat} value={cat} />)}
            </Picker>
            <TextInput
              placeholder="Amount (e.g., 10.50)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={{ backgroundColor: COLORS.card, borderRadius: 8, padding: 12, marginBottom: 12 }}
            />
            <TextInput
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              style={{ backgroundColor: COLORS.card, borderRadius: 8, padding: 12, marginBottom: 12 }}
            />
            <TouchableOpacity onPress={handleAddExpense} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>

            <View style={styles.transactionsContainer}>
              <View style={styles.transactionsHeaderContainer}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
              </View>
              {error && <Text style={{ color: 'red', marginBottom: 10 }}>Error: {error}</Text>} {/* Display error */}
              {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingContainer} />
              ) : transactions?.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
                  <Text style={styles.emptyStateText}>Start by adding your first expense or income.</Text>
                  <TouchableOpacity style={styles.emptyStateButton}>
                    <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={transactions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.transactionCard}>
                      <View style={styles.transactionContent}>
                        <View style={styles.categoryIconContainer} />
                        <View style={styles.transactionLeft}>
                          <Text style={styles.transactionTitle}>{item.title || 'Transaction'}</Text>
                          <Text style={styles.transactionCategory}>{item.category}</Text>
                        </View>
                        <View style={styles.transactionRight}>
                          <Text style={styles.transactionAmount}>{item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}</Text>
                          <Text style={styles.transactionDate}>{item.date}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTransaction(item.id)}>
                        <Text>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  style={styles.transactionsList}
                  contentContainerStyle={styles.transactionsListContent}
                  nestedScrollEnabled={true} // Fix nested scrolling
                />
              )}
            </View>
          </View>
        </SignedIn>

        <SignedOut>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> {/* Basic fallback */}
            <Link href="/(auth)/sign-in">
              <Text style={{ color: COLORS.primary, fontSize: 18, marginVertical: 10 }}>Sign in</Text>
            </Link>
            <Link href="/(auth)/sign-up">
              <Text style={{ color: COLORS.primary, fontSize: 18, marginVertical: 10 }}>Sign up</Text>
            </Link>
          </View>
        </SignedOut>
      </View>
    </KeyboardAwareScrollView>
  );
}
