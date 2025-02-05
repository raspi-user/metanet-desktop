import boomerang from 'boomerang-http'
export default async ({ domain }) => {
  try {
    const manifest = await boomerang(
      'GET',
          `${domain.startsWith('localhost:') ? 'http' : 'https'}://${domain}/manifest.json`
    )
    if (typeof manifest === 'string') {
      return JSON.parse(manifest)
    }
    return manifest
  } catch (e) {
    console.error(e)
    /* ignore, nothing we can do and not our problem */
  }
}
