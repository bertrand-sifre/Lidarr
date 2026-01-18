import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AlbumInteractiveSearchModal from 'Album/Search/AlbumInteractiveSearchModal';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import styles from './WantedAlbumTracks.css';

class WantedAlbumTracks extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isInteractiveSearchOpen: false,
      tracks: [],
      isFetching: false
    };
  }

  componentDidMount() {
    const { albumId } = this.props;
    this.loadTracks(albumId);
  }

  loadTracks = (albumId) => {
    this.setState({ isFetching: true });

    const promise = createAjaxRequest({
      url: `/track?albumId=${albumId}`,
      method: 'GET'
    }).request;

    promise.done((data) => {
      this.setState({ tracks: data, isFetching: false });
    });

    promise.fail(() => {
      this.setState({ isFetching: false });
    });
  };

  //
  // Listeners

  onToggleTrackMonitored = (trackId, monitored) => {
    this.props.onToggleTrackMonitored({ trackId, monitored });
  };

  onSearchTrack = (trackId) => {
    const { albumId } = this.props;
    this.props.onSearchTrack({ albumId, trackId });
  };

  onInteractiveSearchPress = () => {
    this.setState({ isInteractiveSearchOpen: true });
  };

  onInteractiveSearchModalClose = () => {
    this.setState({ isInteractiveSearchOpen: false });
  };

  //
  // Render

  render() {
    const {
      albumId,
      albumTitle,
      isSearching
    } = this.props;

    const { isInteractiveSearchOpen, tracks, isFetching } = this.state;

    if (isFetching) {
      return (
        <TableRow>
          <TableRowCell colSpan={999}>
            <LoadingIndicator />
          </TableRowCell>
        </TableRow>
      );
    }

    if (!tracks || tracks.length === 0) {
      return (
        <TableRow>
          <TableRowCell colSpan={999}>
            No tracks found
          </TableRowCell>
        </TableRow>
      );
    }

    // Filter to only show monitored tracks without files
    const missingMonitoredTracks = tracks.filter((track) =>
      track.monitored && !track.hasFile
    );

    if (missingMonitoredTracks.length === 0) {
      return (
        <TableRow>
          <TableRowCell colSpan={999}>
            No missing monitored tracks
          </TableRowCell>
        </TableRow>
      );
    }

    const columns = [
      { name: 'monitored', label: '', isVisible: true },
      { name: 'trackNumber', label: '#', isVisible: true },
      { name: 'title', label: 'Title', isVisible: true },
      { name: 'actions', label: '', isVisible: true },
      { name: 'interactiveSearch', label: '', isVisible: true }
    ];

    return (
      <TableRow>
        <td colSpan={999} className={styles.expandedRow}>
        <div className={styles.tracksContainer}>
          <Table columns={columns}>
            <TableBody>
              {
                missingMonitoredTracks.map((track) => {
                  return (
                    <TableRow key={track.id}>
                      <TableRowCell className={styles.monitored}>
                        <MonitorToggleButton
                          monitored={track.monitored}
                          onPress={(monitored) => this.onToggleTrackMonitored(track.id, monitored)}
                        />
                      </TableRowCell>
                      <TableRowCell className={styles.trackNumber}>
                        {track.absoluteTrackNumber || track.trackNumber}
                      </TableRowCell>
                      <TableRowCell className={styles.title}>
                        {track.title}
                      </TableRowCell>
                      <TableRowCell className={styles.actions}>
                        <Link onPress={() => this.onSearchTrack(track.id)}>
                          <Icon
                            name={icons.SEARCH}
                            title="Automatic search"
                            className={styles.searchIcon}
                            isSpinning={isSearching}
                          />
                        </Link>
                      </TableRowCell>
                      <TableRowCell className={styles.actions}>
                        <Link onPress={this.onInteractiveSearchPress}>
                          <Icon
                            name={icons.INTERACTIVE}
                            title="Interactive search"
                            className={styles.searchIcon}
                          />
                        </Link>
                      </TableRowCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </div>
        </td>

        <AlbumInteractiveSearchModal
          isOpen={isInteractiveSearchOpen}
          albumId={albumId}
          albumTitle={albumTitle || `Album ${albumId}`}
          onModalClose={this.onInteractiveSearchModalClose}
        />
      </TableRow>
    );
  }
}

WantedAlbumTracks.propTypes = {
  albumId: PropTypes.number.isRequired,
  albumTitle: PropTypes.string,
  isSearching: PropTypes.bool,
  onToggleTrackMonitored: PropTypes.func.isRequired,
  onSearchTrack: PropTypes.func.isRequired
};

export default WantedAlbumTracks;
