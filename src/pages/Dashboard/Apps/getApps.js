const getApps = async ({ sortBy = 'label', limit = 2000 }) => {
  try {
    // Fetch transaction outputs
    const outputs = await window.CWI.getTransactionOutputs({
      basket: 'babbage-protocol-permission',
      limit,
      includeTags: true
    })

    // Use a Set to collect unique originator names from outputs
    const originatorNames = new Set(outputs.reduce((acc, output) => {
      const originatorTag = output.tags?.find(tag => tag.startsWith('babbage_originator'))
      if (originatorTag) {
        acc.add(originatorTag.substring('babbage_originator '.length))
      }
      return acc
    }, new Set()))

    // Fetch transaction labels for each MetaNet app
    const { labels } = await window.CWI.ninja.getTransactionLabels({
      prefix: 'babbage_app_',
      sortBy
    })

    // Filter out projectbabbage.com labels
    const filteredLabels = new Set(
      labels.map(label => label.label.replace(/^babbage_app_/, ''))
        .filter(label => label !== 'projectbabbage.com')
        .slice(0, limit || labels.length)
    )

    // Determine what apps are missing from the filtered labels
    const missingApps = new Set([...originatorNames].filter(app => !filteredLabels.has(app)))

    // Combine the labels and missing apps into one array
    // TODO: Consider sortBy implications...
    const combinedApps = [...filteredLabels, ...missingApps]
    return combinedApps.slice(0, limit)
  } catch (error) {
    console.error('Error fetching app data:', error)
    return []
  }
}
export default getApps