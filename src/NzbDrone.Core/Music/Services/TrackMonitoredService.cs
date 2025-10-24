using System.Linq;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Music.Events;

namespace NzbDrone.Core.Music
{
    public interface ITrackMonitoredService
    {
        void SetTrackMonitored(int trackId, bool monitored);
    }

    public class TrackMonitoredService : ITrackMonitoredService
    {
        private readonly ITrackRepository _trackRepository;
        private readonly IAlbumRepository _albumRepository;
        private readonly IEventAggregator _eventAggregator;

        public TrackMonitoredService(ITrackRepository trackRepository, IAlbumRepository albumRepository, IEventAggregator eventAggregator)
        {
            _trackRepository = trackRepository;
            _albumRepository = albumRepository;
            _eventAggregator = eventAggregator;
        }

        public void SetTrackMonitored(int trackId, bool monitored)
        {
            var track = _trackRepository.Get(trackId);
            track.Monitored = monitored;
            _trackRepository.Update(track);

            var album = _albumRepository.Get(track.AlbumId);

            // If monitoring a track, ensure the album is also monitored (without cascading to other tracks)
            // Else if no tracks of album are monitored, set album to monitored = false
            if (monitored)
            {
                if (!album.Monitored)
                {
                    _albumRepository.SetMonitoredFlat(album, true);
                    _eventAggregator.PublishEvent(new AlbumEditedEvent(album, album));
                }
            }
            else
            {
                var hasMonitoredTracks = _trackRepository
                    .GetTracksByAlbum(track.AlbumId)
                    .Any(t => t.Monitored);
                if (album.Monitored && !hasMonitoredTracks)
                {
                    _albumRepository.SetMonitoredFlat(album, false);
                    _eventAggregator.PublishEvent(new AlbumEditedEvent(album, album));
                }
            }
        }
    }
}
