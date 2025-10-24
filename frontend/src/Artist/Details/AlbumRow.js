import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AlbumSearchCellConnector from 'Album/AlbumSearchCellConnector';
import AlbumTitleLink from 'Album/AlbumTitleLink';
import TrackGroupInfo from 'Album/Details/TrackGroupInfo';
import Label from 'Components/Label';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import StarRating from 'Components/StarRating';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import Popover from 'Components/Tooltip/Popover';
import { kinds, sizes, tooltipPositions } from 'Helpers/Props';
import formatTimeSpan from 'Utilities/Date/formatTimeSpan';
import isAfter from 'Utilities/Date/isAfter';
import translate from 'Utilities/String/translate';
import styles from './AlbumRow.css';

function getTrackCountKind(monitored, releaseDate, trackFileCount, monitoredTrackCount) {
  if (trackFileCount === monitoredTrackCount && monitoredTrackCount > 0) {
    return kinds.SUCCESS;
  }

  if (!releaseDate || isAfter(releaseDate)) {
    return kinds.DISABLED;
  }

  if (!monitored) {
    return kinds.WARNING;
  }

  return kinds.DANGER;
}

class AlbumRow extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isDetailsModalOpen: false,
      isEditAlbumModalOpen: false
    };
  }

  //
  // Listeners

  onManualSearchPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  onEditAlbumPress = () => {
    this.setState({ isEditAlbumModalOpen: true });
  };

  onEditAlbumModalClose = () => {
    this.setState({ isEditAlbumModalOpen: false });
  };

  onMonitorAlbumPress = (monitored, options) => {
    this.props.onMonitorAlbumPress(this.props.id, monitored, options);
  };

  //
  // Render

  render() {
    const {
      id,
      artistId,
      monitored,
      statistics,
      duration,
      releaseDate,
      mediumCount,
      secondaryTypes,
      title,
      ratings,
      disambiguation,
      isSaving,
      artistMonitored,
      foreignAlbumId,
      columns
    } = this.props;

    const {
      trackCount = 0,
      trackFileCount = 0,
      totalTrackCount = 0,
      monitoredTrackCount = 0,
      sizeOnDisk = 0
    } = statistics;

    return (
      <TableRow>
        {
          columns.map((column) => {
            const {
              name,
              isVisible
            } = column;

            if (!isVisible) {
              return null;
            }

            if (name === 'monitored') {
              return (
                <TableRowCell
                  key={name}
                  className={styles.monitored}
                >
                  <MonitorToggleButton
                    monitored={monitored}
                    isDisabled={!artistMonitored}
                    isSaving={isSaving}
                    onPress={this.onMonitorAlbumPress}
                  />
                </TableRowCell>
              );
            }

            if (name === 'title') {
              return (
                <TableRowCell
                  key={name}
                  className={styles.title}
                >
                  <AlbumTitleLink
                    foreignAlbumId={foreignAlbumId}
                    title={title}
                    disambiguation={disambiguation}
                  />
                </TableRowCell>
              );
            }

            if (name === 'mediumCount') {
              return (
                <TableRowCell key={name}>
                  {
                    mediumCount
                  }
                </TableRowCell>
              );
            }

            if (name === 'secondaryTypes') {
              return (
                <TableRowCell key={name}>
                  {secondaryTypes.join(', ')}
                </TableRowCell>
              );
            }

            if (name === 'trackCount') {
              return (
                <TableRowCell key={name}>
                  {
                    totalTrackCount
                  }
                </TableRowCell>
              );
            }

            if (name === 'duration') {
              return (
                <TableRowCell key={name}>
                  {
                    formatTimeSpan(duration)
                  }
                </TableRowCell>
              );
            }

            if (name === 'rating') {
              return (
                <TableRowCell key={name}>
                  {
                    <StarRating
                      rating={ratings.value}
                      votes={ratings.votes}
                    />
                  }
                </TableRowCell>
              );
            }

            if (name === 'releaseDate') {
              return (
                <RelativeDateCellConnector
                  key={name}
                  date={releaseDate}
                />
              );
            }

            if (name === 'size') {
              return (
                <TableRowCell
                  key={name}
                  className={styles.size}
                >
                  {!!sizeOnDisk && formatBytes(sizeOnDisk)}
                </TableRowCell>
              );
            }

            if (name === 'status') {
              return (
                <TableRowCell
                  key={name}
                  className={styles.status}
                >
                  <Popover
                    canFlip={true}
                    anchor={
                      <Label
                        kind={getTrackCountKind(monitored, releaseDate, trackFileCount, monitoredTrackCount)}
                        size={sizes.MEDIUM}
                      >
                        <span>{trackFileCount} / {monitoredTrackCount}</span>
                      </Label>
                    }
                    title={translate('GroupInformation')}
                    body={
                      <TrackGroupInfo
                        totalTrackCount={totalTrackCount}
                        monitoredTrackCount={monitoredTrackCount}
                        trackFileCount={trackFileCount}
                        sizeOnDisk={sizeOnDisk}
                      />
                    }
                    position={tooltipPositions.BOTTOM}
                  />
                </TableRowCell>
              );
            }

            if (name === 'actions') {
              return (
                <AlbumSearchCellConnector
                  key={name}
                  albumId={id}
                  artistId={artistId}
                  albumTitle={title}
                />
              );
            }
            return null;
          })
        }
      </TableRow>
    );
  }
}

AlbumRow.propTypes = {
  id: PropTypes.number.isRequired,
  artistId: PropTypes.number.isRequired,
  monitored: PropTypes.bool.isRequired,
  releaseDate: PropTypes.string,
  mediumCount: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  ratings: PropTypes.object.isRequired,
  disambiguation: PropTypes.string,
  secondaryTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  foreignAlbumId: PropTypes.string.isRequired,
  isSaving: PropTypes.bool,
  unverifiedSceneNumbering: PropTypes.bool,
  artistMonitored: PropTypes.bool.isRequired,
  statistics: PropTypes.object.isRequired,
  mediaInfo: PropTypes.object,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMonitorAlbumPress: PropTypes.func.isRequired
};

AlbumRow.defaultProps = {
  statistics: {
    trackCount: 0,
    trackFileCount: 0,
    totalTrackCount: 0
  }
};

export default AlbumRow;
