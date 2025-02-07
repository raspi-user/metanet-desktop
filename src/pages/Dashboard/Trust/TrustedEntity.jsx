/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Typography, Button, Slider, DialogContent, DialogContentText, DialogActions, Hidden, IconButton } from '@mui/material'
import Delete from '@mui/icons-material/Close'
import CustomDialog from '../../../components/CustomDialog'
const TrustedEntity = ({ entity, setTrustedEntities, classes, history }) => {
  const [trust, setTrust] = useState(entity.trust)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleTrustChange = (e, v) => {
    setTrust(v)
    setTrustedEntities(old => {
      const newEntities = [...old]
      newEntities[newEntities.indexOf(entity)].trust = v
      return newEntities
    })
  }

  const handleDelete = () => {
    setTrustedEntities(old => {
      const newEntities = [...old]
      newEntities.splice(newEntities.indexOf(entity), 1)
      return newEntities
    })
    setDeleteOpen(false)
  }

  return (
    <>
      <div
        className={classes.clickable_entity_icon_name_grid}
        role='button'
        onClick={() => history.push(`/dashboard/counterparty/${entity.publicKey}`)}
      >
        <img src={entity.icon} className={classes.entity_icon} />
        <div>
          <Typography><b>{entity.name}</b></Typography>
          <Typography variant='caption' color='textSecondary'>{entity.note}</Typography>
        </div>
      </div>
      <div className={classes.slider_label_delete_grid}>
        <Typography><b>{trust}</b> / 10</Typography>
        <Slider onChange={handleTrustChange} min={0} max={10} step={1} value={trust} />
        <IconButton onClick={() => setDeleteOpen(true)}><Delete fontSize='small' color='textSecondary' /></IconButton>
      </div>
      <Hidden mdUp>
        <div style={{ minHeight: '0.1em' }} />
        <div />
      </Hidden>
      <CustomDialog title='Delete Trust Relationship' open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogContent>
          <DialogContentText>Do you want to delete this trust relationship?</DialogContentText>
          <div className={classes.entity_icon_name_grid}>
            <img src={entity.icon} className={classes.entity_icon} />
            <div>
              <Typography><b>{entity.name}</b></Typography>
              <Typography variant='caption' color='textSecondary'>{entity.note}</Typography>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete}>Yes, Delete</Button>
        </DialogActions>
      </CustomDialog>
    </>
  )
}
export default TrustedEntity
