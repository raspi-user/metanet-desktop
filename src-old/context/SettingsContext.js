import React, { createContext, useEffect, useState } from 'react'
import { get, set } from 'babbage-kvstore'
import confederacyHost from '../utils/confederacyHost'
import { encrypt, decrypt } from '@babbage/sdk-ts'

const SettingsContext = createContext()
const PROTOCOL_ID = 'cwi settings'

const SettingsProvider = ({ children }) => {
  // Theme settings
  const [settings, setSettings] = useState(() => {
    try {
      if (window.localStorage.settings) {
        return JSON.parse(window.localStorage.settings)
      }
    } catch (error) {
      console.error('Failed to parse settings:', error)
    }
    return { theme: 'light' }
  })
  const confederacyHostURL = confederacyHost()

  /**
   * theme
   * currency = 'USD' | 'BSV' | 'SATS' | 'EUR' | 'GBP' | ''
   */
  const updateSettings = async (newSettings = {}) => {
    const mergedSettings = { ...settings, ...newSettings }

    // Encrypt the settings data
    const encryptedSettings = await encrypt({
      plaintext: Buffer.from(JSON.stringify(mergedSettings)),
      protocolID: [2, PROTOCOL_ID],
      keyID: '1',
      counterparty: 'self',
      returnType: 'string'
    })

    await set(
      Buffer.from('MetaNetClientSettings').toString('base64'), encryptedSettings,
      {
        confederacyHost: confederacyHostURL,
        protocolID: PROTOCOL_ID,
        actionDescription: 'Update MetaNet settings',
        outputDescription: 'New MetaNet settings',
        spendingDescription: 'Old MetaNet settings'
      }
    )
    setSettings(mergedSettings)
  }

  const contextValue = {
    settings,
    updateSettings
  }

  useEffect(() => {
    const getSettings = async () => {
      try {
        // Check for saved settings
        const savedSettings = await get(Buffer.from('MetaNetClientSettings').toString('base64'), undefined, { confederacyHost: confederacyHostURL, protocolID: PROTOCOL_ID })

        if (!savedSettings) return

        // Decrypt user settings using cwi settings protocol!
        const decryptedSettings = await decrypt({
          ciphertext: savedSettings,
          protocolID: [2, PROTOCOL_ID],
          keyID: '1',
          counterparty: 'self',
          returnType: 'string'
        })

        // Load any saved settings
        if (decryptedSettings) {
          window.localStorage.settings = decryptedSettings
          setSettings(JSON.parse(decryptedSettings))
        }
      } catch (error) {
        console.error(error)
      }
    }
    getSettings()
  }, [])

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

export { SettingsProvider, SettingsContext }
