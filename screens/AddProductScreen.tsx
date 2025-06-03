import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddProductScreen() {
  const navigation = useNavigation();  
  const [formData, setFormData] = useState({
    productType: '',
    productName: '',
    productImage: '',
    price: '',
    description: '',
    productCode: '',
    codePrefix: 'P',
    codeNumber: '',
  });

  const productCodePrefixes = ['P', 'T', 'TS'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setFormData({
        ...formData,
        productImage: `data:image/jpeg;base64,${result.assets[0].base64}`
      });
    }
  };

  const updateProductCode = (prefix, number) => {
    const codePrefix = prefix || formData.codePrefix;
    const codeNumber = number || formData.codeNumber;
    
    if (codeNumber) {
      setFormData({
        ...formData,
        codePrefix,
        codeNumber,
        productCode: `${codePrefix}${codeNumber}`
      });
    } else {
      setFormData({
        ...formData,
        codePrefix,
        codeNumber,
        productCode: ''
      });
    }
  };

  const handleSave = async () => {
    if (!formData.productType || !formData.productName || !formData.productCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const storedProducts = await AsyncStorage.getItem('products');
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      products.push(formData);
      await AsyncStorage.setItem('products', JSON.stringify(products));
      toast.success('Product added successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New Product</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Code</Text>
          <View style={styles.codeContainer}>
            <View style={styles.prefixContainer}>
              {productCodePrefixes.map((prefix) => (
                <TouchableOpacity
                  key={prefix}
                  style={[
                    styles.prefixButton,
                    formData.codePrefix === prefix && styles.selectedPrefix
                  ]}
                  onPress={() => updateProductCode(prefix, formData.codeNumber)}
                >
                  <Text style={[
                    styles.prefixText,
                    formData.codePrefix === prefix && styles.selectedPrefixText
                  ]}>
                    {prefix}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.codeInput}
              value={formData.codeNumber}
              onChangeText={(text) => updateProductCode(formData.codePrefix, text)}
              placeholder="Enter number (1-1000)"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          {formData.productCode ? (
            <Text style={styles.codePreview}>Product Code: {formData.productCode}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Type</Text>
          <TextInput
            style={styles.input}
            value={formData.productType}
            onChangeText={(text) => setFormData({...formData, productType: text})}
            placeholder="Enter product type"
          />        
        </View>        
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={formData.productName}
            onChangeText={(text) => setFormData({...formData, productName: text})}
            placeholder="Enter product name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Image</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>Choose Image</Text>
          </TouchableOpacity>
          {formData.productImage ? (
            <Image 
              source={{ uri: formData.productImage }} 
              style={styles.previewImage}
            />
          ) : null}        
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="Enter product description"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => setFormData({...formData, price: text})}
            placeholder="Enter product price"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Product</Text>
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
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prefixContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  prefixButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    marginRight: 4,
    borderRadius: 8,
  },
  selectedPrefix: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  prefixText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPrefixText: {
    color: 'white',
    fontWeight: '500',
  },
  codeInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  codePreview: {
    marginTop: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  imagePickerButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,  
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
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