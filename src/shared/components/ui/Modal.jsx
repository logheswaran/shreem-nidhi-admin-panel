import React from 'react'
import GlobalModal from './GlobalModal'

/**
 * DEPRECATED WRAPPER: Original Modal.jsx
 * This is now a wrapper for the unified GlobalModal system.
 * Use GlobalModal directly for new development.
 */
const Modal = (props) => {
  return <GlobalModal {...props} />
}

export default Modal
