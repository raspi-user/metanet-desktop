export default theme => ({
  table_picture: {
    maxWidth: '3em',
    borderRadius: '3em'
  },
  expires: {
    ...theme.templates.expiryHoverText
  },
  // Show expires on hover
  chipContainer: {
    ...theme.templates.chipContainer
  }
})
