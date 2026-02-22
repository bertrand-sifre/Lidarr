using System.Collections.Generic;
using NLog;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Download;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Music;

namespace NzbDrone.Core.IndexerSearch
{
    public class TrackSearchService : IExecute<TrackSearchCommand>
    {
        private readonly ITrackService _trackService;
        private readonly IArtistService _artistService;
        private readonly ISearchForReleases _releaseSearchService;
        private readonly IProcessDownloadDecisions _processDownloadDecisions;
        private readonly Logger _logger;

        public TrackSearchService(ITrackService trackService,
            IArtistService artistService,
            ISearchForReleases releaseSearchService,
            IProcessDownloadDecisions processDownloadDecisions,
            Logger logger)
        {
            _trackService = trackService;
            _artistService = artistService;
            _releaseSearchService = releaseSearchService;
            _processDownloadDecisions = processDownloadDecisions;
            _logger = logger;
        }

        public void Execute(TrackSearchCommand message)
        {
            var tracks = _trackService.GetTracks(message.TrackIds);

            foreach (var track in tracks)
            {
                if (!track.Monitored)
                {
                    _logger.Debug("Track {0} is not monitored, skipping", track.Title);
                    continue;
                }

                SearchForTrack(track, message.Trigger == CommandTrigger.Manual);
            }
        }

        private void SearchForTrack(Track track, bool userInvokedSearch)
        {
            var artist = _artistService.GetArtistByMetadataId(track.ArtistMetadataId);

            var criteria = new TrackSearchCriteria
            {
                Artist = artist,
                Albums = new List<Album>(),
                Tracks = new List<Track> { track },
                TrackTitle = track.Title,
                UserInvokedSearch = userInvokedSearch
            };

            var albumRelease = track.AlbumRelease?.Value;
            if (albumRelease?.Album?.Value != null)
            {
                criteria.AlbumTitle = albumRelease.Album.Value.Title;
                criteria.AlbumYear = albumRelease.Album.Value.ReleaseDate?.Year ?? 0;
                criteria.Albums = new List<Album> { albumRelease.Album.Value };
            }

            _logger.ProgressInfo("Searching for track: {0} - {1}", artist.Name, track.Title);

            var decisions = _releaseSearchService.TrackSearch(criteria).GetAwaiter().GetResult();
            var processed = _processDownloadDecisions.ProcessDecisions(decisions).GetAwaiter().GetResult();

            _logger.ProgressInfo(
                "Track search completed for [{0} - {1}]. {2} reports downloaded.",
                artist.Name,
                track.Title,
                processed.Grabbed.Count);
        }
    }
}
