import PropTypes from 'prop-types';
import React, { Component } from 'react';
import albumEntities from 'Album/albumEntities';
import AlbumSearchCellConnector from 'Album/AlbumSearchCellConnector';
import AlbumTitleLink from 'Album/AlbumTitleLink';
import EpisodeStatusConnector from 'Album/EpisodeStatusConnector';
import ArtistNameLink from 'Artist/ArtistNameLink';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import WantedAlbumTracksConnector from '../WantedAlbumTracksConnector';
import styles from './CutoffUnmetRow.css';

class CutoffUnmetRow extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isExpanded: false
    };
  }

  //
  // Listeners

  onExpandPress = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  };

  //
  // Render

  render() {
    const {
      id,
      trackFileId,
      artist,
      releaseDate,
      foreignAlbumId,
      albumType,
      title,
      lastSearchTime,
      disambiguation,
      statistics,
      isSelected,
      columns,
      onSelectedChange
    } = this.props;

    const { isExpanded } = this.state;

    if (!artist) {
      return null;
    }

    return (
      <>
        <TableRow>
          <TableRowCell className={styles.expand}>
            <Link onPress={this.onExpandPress}>
              <Icon
                name={isExpanded ? icons.COLLAPSE : icons.EXPAND}
                size={14}
                title={isExpanded ? 'Hide tracks' : 'Show tracks'}
              />
            </Link>
          </TableRowCell>

          <TableSelectCell
            id={id}
            isSelected={isSelected}
            onSelectedChange={onSelectedChange}
          />

          {
            columns.map((column) => {
          const {
            name,
            isVisible
          } = column;

          if (!isVisible) {
            return null;
          }

          if (name === 'artists.sortName') {
            return (
              <TableRowCell key={name}>
                <ArtistNameLink
                  foreignArtistId={artist.foreignArtistId}
                  artistName={artist.artistName}
                />
              </TableRowCell>
            );
          }

          if (name === 'albums.title') {
            return (
              <TableRowCell key={name}>
                <AlbumTitleLink
                  foreignAlbumId={foreignAlbumId}
                  title={title}
                  disambiguation={disambiguation}
                />
              </TableRowCell>
            );
          }

          if (name === 'albumType') {
            return (
              <TableRowCell key={name}>
                {albumType}
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

          if (name === 'albums.lastSearchTime') {
            return (
              <RelativeDateCellConnector
                key={name}
                date={lastSearchTime}
              />
            );
          }

          if (name === 'monitoredTracks') {
            return (
              <TableRowCell key={name}>
                {statistics && statistics.monitoredTrackCount !== undefined ?
                  `${statistics.monitoredTrackCount}/${statistics.totalTrackCount}` :
                  '-'}
              </TableRowCell>
            );
          }

          if (name === 'missingTracks') {
            return (
              <TableRowCell key={name}>
                {statistics && statistics.missingTrackCount !== undefined ?
                  `${statistics.missingTrackCount}/${statistics.monitoredTrackCount}` :
                  '-'}
              </TableRowCell>
            );
          }

          if (name === 'status') {
            return (
              <TableRowCell
                key={name}
                className={styles.status}
              >
                <EpisodeStatusConnector
                  albumId={id}
                  trackFileId={trackFileId}
                  albumEntity={albumEntities.WANTED_CUTOFF_UNMET}
                />
              </TableRowCell>
            );
          }

          if (name === 'actions') {
            return (
              <AlbumSearchCellConnector
                key={name}
                albumId={id}
                artistId={artist.id}
                albumTitle={title}
                albumEntity={albumEntities.WANTED_CUTOFF_UNMET}
                showOpenArtistButton={true}
              />
            );
          }

              return null;
            })
          }
        </TableRow>

        {
          isExpanded &&
            <WantedAlbumTracksConnector
              albumId={id}
              albumTitle={title}
            />
        }
      </>
    );
  }
}

CutoffUnmetRow.propTypes = {
  id: PropTypes.number.isRequired,
  trackFileId: PropTypes.number,
  artist: PropTypes.object.isRequired,
  releaseDate: PropTypes.string.isRequired,
  foreignAlbumId: PropTypes.string.isRequired,
  albumType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  lastSearchTime: PropTypes.string,
  disambiguation: PropTypes.string,
  statistics: PropTypes.object,
  isSelected: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelectedChange: PropTypes.func.isRequired
};

export default CutoffUnmetRow;
