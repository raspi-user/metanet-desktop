import React, { Suspense, lazy, useState, memo } from 'react';
import { Text, View } from 'react-native';

const PhoneEntry = lazy(() => import('shared/components/PhoneEntry'));

const PhonePage = memo(() => {
  const [phoneValue, setPhoneValue] = useState('');

  const handlePhoneChange = (value: string) => {
    console.log('Phone number changed:', value);
    setPhoneValue(value);
  };

  return (
    <View>
      <Suspense fallback={<Text>Loading...</Text>}>
        <PhoneEntry value={phoneValue} onChange={handlePhoneChange} required={true} />
      </Suspense>
      <Text>Phone Page (Updated)</Text>
    </View>
  );
});

export default PhonePage;