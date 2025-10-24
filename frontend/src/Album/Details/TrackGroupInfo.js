import PropTypes from 'prop-types';
import React from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './TrackGroupInfo.css';

function TrackGroupInfo(props) {
  const {
    totalTrackCount,
    monitoredTrackCount,
    trackFileCount,
    sizeOnDisk
  } = props;

  const unmonitoredTrackCount = totalTrackCount - monitoredTrackCount;

  return (
    <DescriptionList>
      <DescriptionListItem
        titleClassName={styles.title}
        descriptionClassName={styles.description}
        title={translate('Total')}
        data={totalTrackCount}
      />

      <DescriptionListItem
        titleClassName={styles.title}
        descriptionClassName={styles.description}
        title={translate('Monitored')}
        data={monitoredTrackCount}
      />

      <DescriptionListItem
        titleClassName={styles.title}
        descriptionClassName={styles.description}
        title={translate('Unmonitored')}
        data={unmonitoredTrackCount}
      />

      <DescriptionListItem
        titleClassName={styles.title}
        descriptionClassName={styles.description}
        title={translate('WithFiles')}
        data={trackFileCount}
      />

      <DescriptionListItem
        titleClassName={styles.title}
        descriptionClassName={styles.description}
        title={translate('SizeOnDisk')}
        data={formatBytes(sizeOnDisk)}
      />
    </DescriptionList>
  );
}

TrackGroupInfo.propTypes = {
  totalTrackCount: PropTypes.number.isRequired,
  monitoredTrackCount: PropTypes.number.isRequired,
  trackFileCount: PropTypes.number.isRequired,
  sizeOnDisk: PropTypes.number.isRequired
};

export default TrackGroupInfo;
