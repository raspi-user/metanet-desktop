import { useContext } from 'react'
import { WalletContext } from '../../../UserInterface'

interface GetAppsParams {
  sortBy?: string
  limit?: number
  walletManager: any
}

interface TransactionOutput {
  tags?: string[]
  // Additional properties can be defined here if needed.
}

interface Action {
  labels?: string[]
  // Additional properties can be defined here if needed.
}

export const getApps = async ({
  sortBy = 'label',
  limit = 2000,
  walletManager
}: GetAppsParams): Promise<string[]> => {
  try {

    // For this refactored implementation, we instantiate WalletClient directly:
    // const walletClient = new WalletClient('json-api', 'non-admin.com')

    // Fetch transaction outputs from the specified basket.
    const { outputs } = await walletManager.listOutputs({
      basket: 'babbage-protocol-permission',
      include: 'locking scripts'
    })

    // Collect unique originator names from the outputs.
    const originatorNames: Set<string> = new Set()
    outputs.forEach(output => {
      if (output.tags && Array.isArray(output.tags)) {
        const originatorTag = output.tags.find(tag =>
          tag.startsWith('babbage_originator')
        )
        if (originatorTag) {
          originatorNames.add(
            originatorTag.substring('babbage_originator '.length)
          )
        }
      }
    })

    // Fetch actions that include labels.
    const { actions } = await walletManager.listActions({
      labels: ['action'],
      labelQueryMode: 'any',
      includeLabels: true
    })

    // Extract app labels from actions by filtering for labels starting with "app_"
    const appLabels: Set<string> = new Set()
    actions.forEach(action => {
      if (action.labels && Array.isArray(action.labels)) {
        action.labels.forEach(label => {
          if (label.startsWith('app_')) {
            const cleanedLabel = label.substring('app_'.length)
            if (cleanedLabel !== 'projectbabbage.com') {
              appLabels.add(cleanedLabel)
            }
          }
        })
      }
    })

    // Identify any apps that appear in originator names but not in appLabels.
    const missingApps = new Set(
      [...originatorNames].filter(app => !appLabels.has(app))
    )

    // Combine the two sets into one list and limit the number of apps returned.
    const combinedApps = [...appLabels, ...missingApps]
    return combinedApps.slice(0, limit)
  } catch (error) {
    console.error('Error fetching app data:', error)
    return []
  }
}

export default getApps
