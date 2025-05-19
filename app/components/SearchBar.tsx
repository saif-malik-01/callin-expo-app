import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const SearchBar = ({ value, onChange }: { value: string; onChange: (text: string) => void }) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search call logs"
        value={value}
        onChangeText={onChange}
        style={styles.input}
        placeholderTextColor={'#888'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
   
    
  },
  input: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    color: '#000',
  },
});

export default SearchBar;