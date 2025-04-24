declare module 'shared/components/PhoneEntry' {
  import { ComponentType } from 'react';
  const PhoneEntry: ComponentType<any>;
  export default PhoneEntry;

  // Override the dialCodes variable type
  const dialCodes: Record<string, string>;

  // Override the countryCodesWithDialCodes variable type
  const countryCodesWithDialCodes: Array<{
    code: string;
    name: string;
    dialCode: string;
  }>;
}