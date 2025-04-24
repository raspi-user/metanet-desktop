import React, { useState, memo } from 'react';
import { Text, View } from 'react-native';
import PhoneEntryWrapper from 'src/PhoneEntryWrapper';

const PhonePage = memo(() => {
  const [phoneValue, setPhoneValue] = useState('');

  const handlePhoneChange = (value: string) => {
    console.log('Phone number changed:', value);
    setPhoneValue(value);
  };

  return (
    <View>
      <PhoneEntryWrapper value={phoneValue} onChange={handlePhoneChange} required={true} />
      <Text>Phone Page (Updated)</Text>
    </View>
  );
});

export default PhonePage;