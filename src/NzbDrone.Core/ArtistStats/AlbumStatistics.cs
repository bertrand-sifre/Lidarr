using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.ArtistStats
{
    public class AlbumStatistics : ResultSet
    {
        public int ArtistId { get; set; }
        public int AlbumId { get; set; }
        public int TrackFileCount { get; set; }
        public int TrackCount { get; set; }
        public int AvailableTrackCount { get; set; }
        public int TotalTrackCount { get; set; }
        public int MonitoredTrackCount { get; set; }
        public int MissingTrackCount { get; set; }
        public long SizeOnDisk { get; set; }

        public int UnmonitoredTrackCount => TotalTrackCount - MonitoredTrackCount;
    }
}
