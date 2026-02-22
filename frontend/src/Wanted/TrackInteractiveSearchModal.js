import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import TrackInteractiveSearchModalContent from './TrackInteractiveSearchModalContent';

function TrackInteractiveSearchModal(props) {
  const {
    isOpen,
    trackId,
    trackTitle,
    onModalClose
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      size={sizes.EXTRA_EXTRA_LARGE}
      closeOnBackgroundClick={false}
      onModalClose={onModalClose}
    >
      {
        isOpen && trackId != null ?
          <TrackInteractiveSearchModalContent
            trackId={trackId}
            trackTitle={trackTitle}
            onModalClose={onModalClose}
          /> :
          null
      }
    </Modal>
  );
}

TrackInteractiveSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  trackId: PropTypes.number,
  trackTitle: PropTypes.string,
  onModalClose: PropTypes.func.isRequired
};

export default TrackInteractiveSearchModal;
