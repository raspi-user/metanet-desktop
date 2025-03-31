import { WalletInterface } from '@bsv/sdk'

interface GetAppsParams {
  sortBy?: string
  limit?: number
  permissionsManager: WalletInterface
  adminOriginator: string
}

export const getApps = async ({
  sortBy = 'label',
  limit = 2000,
  permissionsManager,
  adminOriginator
}: GetAppsParams): Promise<string[]> => {
  try {
    console.log("GETTING APPS....")
    // Fetch transaction outputs from the specified basket.
    const { outputs } = await permissionsManager.listOutputs({
      basket: 'admin protocol-permission',
      include: 'locking scripts',
      includeTags: true,
      includeLabels: true
    }, adminOriginator)

    // Collect unique originator names from the outputs.
    const originatorNames: Set<string> = new Set()
    outputs.forEach(output => {
      if (output.tags && Array.isArray(output.tags)) {
        const originatorTag = output.tags.find(tag =>
          tag.startsWith('originator')
        )
        if (originatorTag) {
          originatorNames.add(
            originatorTag.substring('originator '.length)
          )
        }
      }
    })

    // Fetch actions that include labels.
    const { actions } = await permissionsManager.listActions({
      labels: [],
      labelQueryMode: 'any',
      includeLabels: true
    }, adminOriginator)

    // Extract app labels from actions by filtering for labels starting with "app_"
    const appLabels: Set<string> = new Set()
    actions.forEach(action => {
      if (action.labels && Array.isArray(action.labels)) {
        action.labels.forEach(label => {
          if (label.startsWith('admin originator ')) { // app_
            const cleanedLabel = label.substring('admin originator '.length)
            // if (cleanedLabel !== 'projectbabbage.com') {
            appLabels.add(cleanedLabel)
            // }
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
