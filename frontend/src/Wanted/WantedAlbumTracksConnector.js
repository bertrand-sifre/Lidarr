import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchTracks, toggleTrackMonitored } from 'Store/Actions/trackActions';
import { executeCommand } from 'Store/Actions/commandActions';
import * as commandNames from 'Commands/commandNames';
import WantedAlbumTracks from './WantedAlbumTracks';

function createMapStateToProps() {
  return createSelector(
    () => {
      return {
        isSearching: false
      };
    }
  );
}

const mapDispatchToProps = {
  fetchTracks,
  toggleTrackMonitored,
  executeCommand
};

function createMapDispatchToProps(dispatch, props) {
  return {
    onToggleTrackMonitored({ trackId, monitored }) {
      dispatch(toggleTrackMonitored({ trackId, monitored }));
    },

    onSearchTrack({ albumId, trackId }) {
      dispatch(executeCommand({
        name: commandNames.ALBUM_SEARCH,
        albumIds: [albumId]
      }));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(WantedAlbumTracks);
