/* eslint-disable indent */
/* eslint-disable react/prop-types */
import React, { useState, useContext, useEffect } from 'react'
import { Typography, Button, IconButton } from '@mui/material'
import { makeStyles } from '@mui/styles'
import style from './style.js'
import AddIdCertIcon from '../../../images/addIdCertIcon'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import UIContext from '../../../UIContext.js'
import { decryptCertificateFields } from 'authrite-utils'
import AddPopularSigniaCertifiersModal from './AddPopularSigniaCertifiersModal.jsx'
import EyeCon from '@mui/icons-material/Visibility'
import CertificatesGrid from './CertificatesGrid.jsx'

const useStyles = makeStyles(style, {
  name: 'MyIdentity'
})

const Trust = ({ history }) => {
  const { env } = useContext(UIContext)

  const [search, setSearch] = useState('')
  const [addPopularSigniaCertifiersModalOpen, setAddPopularSigniaCertifiersModalOpen] = useState(false)
  const [certificates, setCertificates] = useState([])
  const [primaryIdentityKey, setPrimaryIdentityKey] = useState('...')
  const [privilegedIdentityKey, setPrivilegedIdentityKey] = useState('...')
  const [copied, setCopied] = useState({ id: false })
  const classes = useStyles()

  const handleCopy = (data, type) => {
    navigator.clipboard.writeText(data)
    setCopied({ ...copied, [type]: true })
    setTimeout(() => {
      setCopied({ ...copied, [type]: false })
    }, 2000)
  }

  useEffect(() => {
    const cacheKey = 'provenCertificates'

    const getProvenCertificates = async () => {
      // Attempt to load the proven certificates from cache
      const cachedProvenCerts = window.localStorage.getItem(cacheKey)
      if (cachedProvenCerts) {
        setCertificates(JSON.parse(cachedProvenCerts))
      }

      // Find and prove certificates if not in cache
      const certs = await window.CWI.ninja.findCertificates()
      const provenCerts = []
      if (certs && certs.certificates && certs.certificates.length > 0) {
        for (const certificate of certs.certificates) {
          try {
            const fieldsToReveal = Object.keys(certificate.fields)
            const proof = await window.CWI.proveCertificate({
              certificate,
              fieldsToReveal,
              verifierPublicIdentityKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
            })
            const decrypted = await decryptCertificateFields(certificate, proof.keyring, '0000000000000000000000000000000000000000000000000000000000000001')
            proof.decryptedFields = decrypted
            provenCerts.push(proof)
          } catch (e) {
            console.error(e)
          }
        }
        if (provenCerts.length > 0) {
          setCertificates(provenCerts)
          window.localStorage.setItem(cacheKey, JSON.stringify(provenCerts))
        }
      }
    }

    getProvenCertificates()

    // Set primary identity key
    const setIdentityKey = async () => {
      setPrimaryIdentityKey(await window.CWI.getPublicKey({ identityKey: true }))
    }

    setIdentityKey()
  }, [setCertificates, setPrimaryIdentityKey])

  const handleRevealSecureKey = async () => {
    try {
      setPrivilegedIdentityKey(await window.CWI.getPublicKey({
        identityKey: true,
        privileged: true,
        reason: 'Reveal your secure identity key alongside your everyday one.'
      }))
    } catch (e) { }
  }

  const shownCertificates = certificates.filter(x => {
    if (!search) {
      return true
    }
    // filter...
    return false
    // return x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 || x.note.toLowerCase().indexOf(search.toLowerCase()) !== -1
  })

  return (
    <div className={classes.content_wrap}>
      <Typography variant='h1' color='textPrimary' paddingBottom='0.5em'>{env === 'staging' ? 'Stageline' : 'My'} Identity</Typography>
      <Typography variant='body' color='textSecondary'>
        <b>Everyday Identity Key:</b> {primaryIdentityKey}
        <IconButton size='small' onClick={() => handleCopy(primaryIdentityKey, 'id')} disabled={copied.id}>
          {copied.id ? <CheckIcon /> : <ContentCopyIcon fontSize='small' />}
        </IconButton>
      </Typography>
      <Typography variant='body' color='textSecondary'>
        <b>Secure Identity Key:</b> {privilegedIdentityKey === '...' ? <IconButton onClick={handleRevealSecureKey}><EyeCon /></IconButton> : privilegedIdentityKey}
        {privilegedIdentityKey !== '...' && <IconButton size='small' onClick={() => handleCopy(privilegedIdentityKey, 'id')} disabled={copied.id}>
          {copied.id ? <CheckIcon /> : <ContentCopyIcon fontSize='small' />}
        </IconButton>}
      </Typography>
      <Typography variant='h2' color='textPrimary' padding='0.5em 0em 0.5em 0em'>Certificates</Typography>
      <Typography
        paragraph
        variant='body'
        color='textSecondary'
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          paddingBottom: '1em'
        }}>
        As you go about your life, people and businesses you interact with can give you certificates and credentials for your qualifications. You can also register with popular certifiers so you show up in apps when people interact with you.
      </Typography>
      {/* <TextField TODO: Search certificates
        value={search}
        onChange={(e => setSearch(e.target.value))}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' />
            </InputAdornment>
          )
        }}
        label='Search'
        placeholder='Find certificates...'
        fullWidth
        sx={{
          '& .MuiInputLabel-root': {
            fontSize: '0.8rem'
          },
          '& .MuiOutlinedInput-root': {
            height: '36px',
            padding: '0 10px'
          }
        }}
      /> */}

      {/* <div className={classes.master_grid}>
        {shownCertificates.map((cert, i) => <div key={i}>
          <CertificateChip
            certType={cert.type}
            issuer={cert.certifier}
            fieldsToDisplay={cert.decryptedFields}
          />
        </div>)}
      </div> */}
      <CertificatesGrid certificates={shownCertificates} />

      {shownCertificates.length === 0 && (
        <Typography align='center' color='textSecondary' style={{ marginTop: '2em' }}>No Certificates!</Typography>
      )}
      <AddPopularSigniaCertifiersModal
        open={addPopularSigniaCertifiersModalOpen}
        setOpen={setAddPopularSigniaCertifiersModalOpen}
        classes={classes}
        history={history}
      />
      <br />
      <center>
        <div style={{ paddingBottom: '3em' }}>
          {certificates.length === 0
            ? <Typography variant='h3' align='center' color='textPrimary' className={classes.oracle_open_title}>
              Please register your identity to start using the MetaNet Client.
            </Typography>
            : <Typography variant='h3' align='center' color='textPrimary' className={classes.oracle_open_title}>
              Register with more Identity Certifiers on the MetaNet.
            </Typography>
          }
          <br />
          <Button
            className={classes.oracle_button}
            startIcon={<AddIdCertIcon />}
            variant='outlined'
            onClick={() => {
              setAddPopularSigniaCertifiersModalOpen(true)
            }}
          >
            {certificates.length === 0 ? 'Register your identity' : 'Popular Certifiers'}
          </Button>
        </div>
      </center>
    </div>
  )
}

export default Trust
