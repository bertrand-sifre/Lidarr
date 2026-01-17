import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createAlbumSelector from 'Store/Selectors/createAlbumSelector';
import createQueueItemSelector from 'Store/Selectors/createQueueItemSelector';
import createTrackFileSelector from 'Store/Selectors/createTrackFileSelector';
import createTrackSelector from 'Store/Selectors/createTrackSelector';
import EpisodeStatus from './EpisodeStatus';

function createMapStateToProps() {
  return createSelector(
    createAlbumSelector(),
    createTrackSelector(),
    createQueueItemSelector(),
    createTrackFileSelector(),
    (album, track, queueItem, trackFile) => {
      const result = _.pick(album, [
        'releaseDate',
        'grabbed'
      ]);

      // Use track's monitored status instead of album's
      result.trackMonitored = track && track.monitored;
      // Indicate if we're showing track-level or album-level status
      result.albumMonitored = album.monitored;

      result.queueItem = queueItem;
      result.trackFile = trackFile;

      return result;
    }
  );
}

const mapDispatchToProps = {
};

class EpisodeStatusConnector extends Component {

  //
  // Render

  render() {
    return (
      <EpisodeStatus
        {...this.props}
      />
    );
  }
}

EpisodeStatusConnector.propTypes = {
  albumId: PropTypes.number.isRequired,
  trackId: PropTypes.number,
  trackFileId: PropTypes.number.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(EpisodeStatusConnector);
