// src/shims/reanimated.js
if (typeof window !== 'undefined') {
  // Mock Reanimated APIs for web
  module.exports = {
    useSharedValue: (initialValue) => ({ value: initialValue }),
    useAnimatedStyle: (styleFn) => styleFn(),
    withSpring: (value) => value, // Skip animations
    withTiming: (value) => value, // Skip animations
    Easing: { linear: () => {}, bezier: () => {} },
    // Add other required Reanimated APIs
  };
} else {
  module.exports = require('react-native-reanimated');
}