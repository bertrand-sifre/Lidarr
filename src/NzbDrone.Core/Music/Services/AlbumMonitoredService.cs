using System;
using System.Collections.Generic;
using System.Linq;
using NLog;

namespace NzbDrone.Core.Music
{
    public interface IAlbumMonitoredService
    {
        void SetAlbumMonitoredStatus(Artist artist, MonitoringOptions monitoringOptions);
    }

    public class AlbumMonitoredService : IAlbumMonitoredService
    {
        private readonly IArtistService _artistService;
        private readonly IAlbumService _albumService;
        private readonly ITrackService _trackService;
        private readonly Logger _logger;

        public AlbumMonitoredService(IArtistService artistService, IAlbumService albumService, ITrackService trackService, Logger logger)
        {
            _artistService = artistService;
            _albumService = albumService;
            _trackService = trackService;
            _logger = logger;
        }

        public void SetAlbumMonitoredStatus(Artist artist, MonitoringOptions monitoringOptions)
        {
            // Update the artist without changing the albums
            if (monitoringOptions == null)
            {
                _artistService.UpdateArtist(artist);
                return;
            }

            var monitoredAlbums = monitoringOptions.AlbumsToMonitor;

            if (monitoringOptions.Monitor == MonitorTypes.Unknown && monitoredAlbums is not { Count: not 0 })
            {
                return;
            }

            _logger.Debug("[{0}] Setting album monitored status.", artist.Name);

            var albums = _albumService.GetAlbumsByArtist(artist.Id);

            // If specific albums are passed use those instead of the monitoring options.
            if (monitoredAlbums.Any())
            {
                ToggleAlbumsMonitoredState(albums.Where(s => monitoredAlbums.Contains(s.ForeignAlbumId)), true, setTracks: true);
                ToggleAlbumsMonitoredState(albums.Where(s => !monitoredAlbums.Contains(s.ForeignAlbumId)), false, setTracks: true);
            }
            else
            {
                var albumsWithFiles = _albumService.GetArtistAlbumsWithFiles(artist);
                var albumsWithoutFiles = albums.Where(c => !albumsWithFiles.Select(e => e.Id).Contains(c.Id) && c.ReleaseDate <= DateTime.UtcNow).ToList();

                switch (monitoringOptions.Monitor)
                {
                    case MonitorTypes.All:
                        _logger.Debug("Monitoring all albums");
                        ToggleAlbumsMonitoredState(albums, true, setTracks: true);
                        break;
                    case MonitorTypes.Future:
                        _logger.Debug("Unmonitoring Albums with Files");
                        ToggleAlbumsMonitoredState(albums.Where(e => albumsWithFiles.Select(c => c.Id).Contains(e.Id)), false, setTracks: true);
                        _logger.Debug("Unmonitoring Albums without Files");
                        ToggleAlbumsMonitoredState(albums.Where(e => albumsWithoutFiles.Select(c => c.Id).Contains(e.Id)), false, setTracks: true);
                        break;
                    case MonitorTypes.Missing:
                        _logger.Debug("Unmonitoring Albums with Files");
                        ToggleAlbumsMonitoredState(albums.Where(e => albumsWithFiles.Select(c => c.Id).Contains(e.Id)), false, setTracks: true);
                        _logger.Debug("Monitoring Albums without Files");
                        ToggleAlbumsMonitoredState(albums.Where(e => albumsWithoutFiles.Select(c => c.Id).Contains(e.Id)), true, setTracks: true);
                        break;
                    case MonitorTypes.Existing:
                        _logger.Debug("Monitoring Albums with Files");
                        ToggleAlbumsMonitoredState(albums.Where(e => albumsWithFiles.Select(c => c.Id).Contains(e.Id)), true, setTracks: true);
                        _logger.Debug("Unmonitoring Albums without Files");
                        ToggleAlbumsMonitoredState(albums.Where(e => albumsWithoutFiles.Select(c => c.Id).Contains(e.Id)), false, setTracks: true);
                        break;
                    case MonitorTypes.Latest:
                        _logger.Debug("Monitoring latest album");
                        ToggleAlbumsMonitoredState(albums, false, setTracks: true);
                        ToggleAlbumsMonitoredState(albums.OrderByDescending(e => e.ReleaseDate).Take(1), true, setTracks: true);
                        break;
                    case MonitorTypes.First:
                        _logger.Debug("Monitoring first album");
                        ToggleAlbumsMonitoredState(albums, false, setTracks: true);
                        ToggleAlbumsMonitoredState(albums.OrderBy(e => e.ReleaseDate).Take(1), true, setTracks: true);
                        break;
                    case MonitorTypes.None:
                        _logger.Debug("Unmonitoring all albums");
                        ToggleAlbumsMonitoredState(albums, false, setTracks: true);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }

            _albumService.UpdateMany(albums);
            _artistService.UpdateArtist(artist);
        }

        private void ToggleAlbumsMonitoredState(IEnumerable<Album> albums, bool monitored, bool setTracks = false)
        {
            foreach (var album in albums)
            {
                album.Monitored = monitored;
            }

            if (setTracks)
            {
                var allTracks = albums.ToList()
                    .SelectMany(a => _trackService.GetTracksByAlbum(a.Id))
                    .ToList();
                foreach (var track in allTracks)
                {
                    track.Monitored = monitored;
                }

                _trackService.UpdateMany(allTracks);
                _logger.Debug("Update {0} tracks to monitored={1}", allTracks.Count, monitored);
            }
        }
    }
}
