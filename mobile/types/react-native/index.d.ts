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
      style?: any;
      placeholder?: string;
      keyboardType?: string;
      editable?: boolean;
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
  
    // Define the instance type for TextInput
    export interface TextInputInstance {
      focus(): void;
      blur(): void;
      clear(): void;
      isFocused(): boolean;
    }
  
    // Define TextInput as a type alias for the instance type
    export type TextInput = TextInputInstance;
  
    // Define TextInput as a React component
    export const TextInput: React.ForwardRefExoticComponent<
      TextInputProps & React.RefAttributes<TextInputInstance>
    >;
  
    export const Modal: React.ComponentType<ModalProps>;
    export const ScrollView: React.ComponentType<ScrollViewProps>;
    export const StyleSheet: {
      create: (styles: any) => any;
    };
    export const LogBox: any;
    export const YellowBox: any;
  }