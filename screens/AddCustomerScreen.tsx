import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function AddCustomerScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    city: '',
    mobileNumber: '',
  });

  const handleSave = async () => {
    if (!formData.companyName || !formData.contactPerson || !formData.city || !formData.mobileNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const storedCustomers = await AsyncStorage.getItem('customers');
      const customers = storedCustomers ? JSON.parse(storedCustomers) : [];
      customers.push(formData);
      await AsyncStorage.setItem('customers', JSON.stringify(customers));
      toast.success('Customer added successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New Customer</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Company/Customer Name</Text>
          <TextInput
            style={styles.input}
            value={formData.companyName}
            onChangeText={(text) => setFormData({...formData, companyName: text})}
            placeholder="Enter company name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={formData.contactPerson}
            onChangeText={(text) => setFormData({...formData, contactPerson: text})}
            placeholder="Enter contact person name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({...formData, city: text})}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={formData.mobileNumber}
            onChangeText={(text) => setFormData({...formData, mobileNumber: text})}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Customer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});