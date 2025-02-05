export default theme => ({
  fixed_nav: {
    backgroundColor: theme.palette.background.default,
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '100vw',
    zIndex: 1300,
    boxSizing: 'border-box',
    // boxShadow: '10 10 10 10',
    boxShadow: 'rgba(0.51, 0.51, 0.51, 35%) 0px 4px 10px'
  },
  title_close_grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridGap: theme.spacing(2),
    padding: '0px 0.5em 0px 1.5em'
  },
  placeholder: {
    height: '6em'
  },
  title_text: {
    paddingTop: '0.5em'
  }
})
