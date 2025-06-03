import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Modal, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('customers');  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'customer' or 'product'
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);  const deleteItem = async (item, type) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete this ${type}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const storageKey = type === 'customer' ? 'customers' : 'products';
              const storedItems = await AsyncStorage.getItem(storageKey);
              let items = JSON.parse(storedItems);
              
              if (type === 'customer') {
                items = items.filter(i => i.companyName !== item.companyName);
                setCustomers(items);
              } else {
                items = items.filter(i => i.productName !== item.productName);
                setProducts(items);
              }
              
              await AsyncStorage.setItem(storageKey, JSON.stringify(items));
              toast.success(`${type} deleted successfully`);
            } catch (error) {
              console.error('Error deleting item:', error);
              toast.error('Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const updateItem = async (updatedItem, type) => {
    try {
      const storageKey = type === 'customer' ? 'customers' : 'products';
      const storedItems = await AsyncStorage.getItem(storageKey);
      let items = JSON.parse(storedItems);
      
      if (type === 'customer') {
        items = items.map(i => i.companyName === editingItem.companyName ? updatedItem : i);
        setCustomers(items);
      } else {
        items = items.map(i => i.productName === editingItem.productName ? updatedItem : i);
        setProducts(items);
      }
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(items));
      setEditModalVisible(false);
      setEditingItem(null);
      toast.success(`${type} updated successfully`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const loadData = async () => {
    try {
      const storedCustomers = await AsyncStorage.getItem('customers');
      const storedProducts = await AsyncStorage.getItem('products');
      
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };  const shareToWhatsApp = (data, type) => {
    let message = '';
    if (type === 'customer') {
      message = `Company: ${data.companyName}\nContact: ${data.contactPerson}\nCity: ${data.city}\nMobile: ${data.mobileNumber}`;
    } else {      message = `*Product Details*\nName: ${data.productName}\nType: ${data.productType}\nPrice: $${data.price}\n\nDescription: ${data.description || 'N/A'}`;
    }
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err => console.error('Error opening WhatsApp:', err));
  };  const renderCustomerItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.customerContent}>
        <View style={styles.customerInfo}>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <Text style={styles.contactPerson}>Contact: {item.contactPerson}</Text>
          <Text style={styles.details}>📍 {item.city}</Text>
          <Text style={styles.details}>📱 {item.mobileNumber}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setEditingItem(item);
              setEditingType('customer');
              setEditModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteItem(item, 'customer')}
          >
            <MaterialIcons name="delete" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => shareToWhatsApp(item, 'customer')}
          >
            <MaterialIcons name="share" size={24} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedProduct(item);
        setModalVisible(true);
      }}
    >
      {item.productImage && (
        <Image source={{ uri: item.productImage }} style={styles.productImage} />
      )}
      <View style={styles.productContent}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productType}>{item.productType}</Text>
          <Text style={styles.productPrice}>Price: ${item.price}</Text>
        </View>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={(e) => {
            e.stopPropagation();
            shareToWhatsApp(item, 'product');
          }}
        >
          <MaterialIcons name="share" size={24} color="#25D366" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>  <View style={styles.header}>
    <Text style={styles.companyTitle}>RKM LOOM SPARES</Text>
    <Text style={styles.headerTitle}>Database Manager</Text>
  </View>
  <TouchableOpacity 
    style={[styles.addButton, styles.floatingButton]}
    onPress={() => navigation.navigate(activeTab === 'customers' ? 'AddCustomer' : 'AddProduct')}
  >
    <MaterialIcons name="add" size={24} color="white" />
  </TouchableOpacity>      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'customers' && styles.activeTab]}
          onPress={() => setActiveTab('customers')}
        >
          <Text style={[styles.tabText, activeTab === 'customers' && styles.activeTabText]}>
            Customers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products
          </Text>
        </TouchableOpacity>
      </View>      <FlatList
        data={activeTab === 'customers' 
          ? customers.filter(customer => 
              customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
              customer.city.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : products.filter(product =>
              product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.productType.toLowerCase().includes(searchQuery.toLowerCase())
            )}
        renderItem={activeTab === 'customers' ? renderCustomerItem : renderProductItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}      />      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                {selectedProduct.productImage && (
                  <Image 
                    source={{ uri: selectedProduct.productImage }} 
                    style={styles.modalImage} 
                  />
                )}
                <Text style={styles.modalTitle}>{selectedProduct.productName}</Text>
                <Text style={styles.modalType}>Type: {selectedProduct.productType}</Text>
                <Text style={styles.modalPrice}>Price: ${selectedProduct.price}</Text>
                <Text style={styles.modalDescription}>
                  {selectedProduct.description || 'No description available'}
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.shareWhatsAppButton}
                    onPress={() => {
                      shareToWhatsApp(selectedProduct, 'product');
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.shareButtonText}>Share on WhatsApp</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>      </Modal>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {editingItem && (
              <>
                <Text style={styles.modalTitle}>
                  Edit {editingType === 'customer' ? 'Customer' : 'Product'}
                </Text>
                
                {editingType === 'customer' ? (
                  <>
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.companyName}
                      onChangeText={(text) => setEditingItem({...editingItem, companyName: text})}
                      placeholder="Company Name"
                    />
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.contactPerson}
                      onChangeText={(text) => setEditingItem({...editingItem, contactPerson: text})}
                      placeholder="Contact Person"
                    />
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.city}
                      onChangeText={(text) => setEditingItem({...editingItem, city: text})}
                      placeholder="City"
                    />
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.mobileNumber}
                      onChangeText={(text) => setEditingItem({...editingItem, mobileNumber: text})}
                      placeholder="Mobile Number"
                      keyboardType="phone-pad"
                    />
                  </>
                ) : (
                  <>
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.productName}
                      onChangeText={(text) => setEditingItem({...editingItem, productName: text})}
                      placeholder="Product Name"
                    />
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.productType}
                      onChangeText={(text) => setEditingItem({...editingItem, productType: text})}
                      placeholder="Product Type"
                    />
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.price}
                      onChangeText={(text) => setEditingItem({...editingItem, price: text})}
                      placeholder="Price"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.editInput, styles.descriptionInput]}
                      value={editingItem.description}
                      onChangeText={(text) => setEditingItem({...editingItem, description: text})}
                      placeholder="Description"
                      multiline={true}
                      numberOfLines={4}
                    />
                  </>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => updateItem(editingItem, editingType)}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setEditingItem(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  companyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },  addButton: {
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  customerInfo: {
    gap: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactPerson: {
    fontSize: 16,
    color: '#666',
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },  productContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  customerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productType: {
    fontSize: 16,
    color: '#666',  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalType: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  editInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  shareWhatsAppButton: {
    flex: 1,
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});