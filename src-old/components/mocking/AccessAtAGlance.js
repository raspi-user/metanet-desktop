// Current Dojo Spec
/*
#### getTransactionOutputs

Returns a set of transaction outputs that Dojo has tracked

##### Parameters

*   `obj` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are given in an object (optional, default `{}`)

    *   `obj.basket` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** If provided, indicates which basket the outputs should be selected from.
    *   `obj.tracked` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** If provided, only outputs with the corresponding tracked value will be returned (true/false).
    *   `obj.includeEnvelope` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** If provided, returns a structure with the SPV envelopes for the UTXOS that have not been spent. (optional, default `false`)
    *   `obj.spendable` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** If given as true or false, only outputs that have or have not (respectively) been spent will be returned. If not given, both spent and unspent outputs will be returned.
    *   `obj.type` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** If provided, only outputs of the specified type will be returned. If not provided, outputs of all types will be returned.
    *   `obj.limit` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Provide a limit on the number of outputs that will be returned. (optional, default `25`)
    *   `obj.offset` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Provide an offset into the list of outputs. (optional, default `0`)
*/

const THREE_HOURS = 180 * 60 * 1000

const getTransactionOutputs = ({ basket, type, originator, order, limit }) => {
  if (basket === 'DPACP') {
    return {
      basketId: 'dpacp',
      securityLevel: 1,
      protocolID: 'Authrite',
      counterparty: '023134563145080d3aee10aa0e342e45dae60cf1f35d31fb017d7f68033ae88822'
    }
  } else if (type === 'counterparty') {
    return {
      basketId: 'todo',
      counterparty: '023134563145080d3aee10aa0e342e45dae60cf1f35d31fb017d7f68033ae88822',
      lastAccessed: Date.now() - THREE_HOURS,
      history: [
        {
          basketId: 'tempo',
          lastAccessed: Date.now() - 200000
        },
        {
          basketId: 'botcrafter',
          lastAccessed: Date.now() - 300000
        }
      ]
    }
  } else if (basket === 'DBAP') {
    return {
      basketId: 'convo',
      lastAccessed: Date.now() - THREE_HOURS,
      history: [
        {
          basketId: 'tempo',
          lastAccessed: Date.now() - 200000
        },
        {
          basketId: 'botcrafter',
          lastAccessed: Date.now() - 300000
        }
      ]
    }
  } else if (basket === 'DCAP') {
    return {
      certType: 'AGfk/WrT1eBDXpz3mcw386Zww2HmqcIn3uY6x4Af1eo=',
      lastAccessed: Date.now() - THREE_HOURS,
      issuer: 'O=Government Root Certification Authority',
      verifier: '023134563145080d3aee10aa0e342e45dae60cf1f35d31fb017d7f68033ae88822',
      history: [
        {
          certType: 'z40BOInXkI8m7f/wBrv4MJ09bZfzZbTj2fJqCtONqCY=',
          lastAccessed: Date.now() - 200000,
          issuer: 'CN=D-TRUST Root Class 3 CA 2 2009 O=D-Trust GmbH',
          verifier: '032e5bd6b837cfb30208bbb1d571db9ddf2fb1a7b59fb4ed2a31af632699f770a1'
        },
        {
          certType: 'AGfk/WrT1eBDXpz3mcw386Zww2HmqcIn3uY6x4Af1eo=',
          lastAccessed: Date.now() - 300000,
          issuer: 'CN=SecureSign RootCA11 O=Japan Certification Services, Inc.',
          verifier: '03efedf63f94ff1fa137d102cda6e6b406c8167d989a778098791da7ff6a29769b'
        }
      ]
    }
  }
}

export default getTransactionOutputs
