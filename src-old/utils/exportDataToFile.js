/**
 * Exports data to a file with a specified format and filename.
 *
 * @param {Object} params - The parameters object.
 * @param {*} params.data - The data to be exported.
 * @param {String} params.filename - The filename for the exported file.
 * @param {String} params.type - The MIME type of the file.
 */
const exportDataToFile = ({ data, filename, type }) => {
  let exportedData

  // Depending on the MIME type, process the data accordingly
  if (type === 'application/json') {
    exportedData = JSON.stringify(data, null, 2)
  } else if (type === 'text/plain') {
    exportedData = data
  } else {
    throw new Error('Unsupported file type')
  }

  // Create a new Blob object using the processed data
  const blob = new Blob([exportedData], { type })

  // Create a temporary anchor element to trigger the download
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename

  // Append the link, trigger the download, and then clean up
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default exportDataToFile
