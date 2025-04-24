declare module 'react-native' {
    import * as React from 'react';
  
    export interface GestureResponderEvent {
      nativeEvent: any;
      target: any;
      currentTarget: any;
      touches: any[];
      changedTouches: any[];
      identifier: number;
      locationX: number;
      locationY: number;
      pageX: number;
      pageY: number;
      timestamp: number;
      preventDefault: () => void;
    }
  
    export interface TextInputProps {
      value?: string;
      onChangeText?: (text: string) => void;
      [key: string]: any;
    }
  
    export interface ViewProps {
      style?: any;
      children?: React.ReactNode;
      [key: string]: any;
    }
  
    export interface TextProps {
      style?: any;
      children?: React.ReactNode;
      [key: string]: any;
    }
  
    export interface ModalProps {
      visible?: boolean;
      onRequestClose?: () => void;
      [key: string]: any;
    }
  
    export interface ScrollViewProps {
      style?: any;
      contentContainerStyle?: any;
      children?: React.ReactNode;
      [key: string]: any;
    }
  
    export const Platform: {
      OS: string;
      Version: number;
      select: (obj: any) => any;
    };
  
    export const View: React.ComponentType<ViewProps>;
    export const Text: React.ComponentType<TextProps>;
    export type TextInput = React.ComponentType<TextInputProps>; // Define as type alias
    export const TextInput: TextInput;
    export const Modal: React.ComponentType<ModalProps>;
    export const ScrollView: React.ComponentType<ScrollViewProps>;
    export const StyleSheet: {
      create: (styles: any) => any;
    };
    export const LogBox: any;
    export const YellowBox: any;
  }