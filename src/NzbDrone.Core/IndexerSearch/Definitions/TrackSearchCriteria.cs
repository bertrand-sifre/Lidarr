namespace NzbDrone.Core.IndexerSearch.Definitions
{
    public class TrackSearchCriteria : SearchCriteriaBase
    {
        public string TrackTitle { get; set; }
        public string AlbumTitle { get; set; }
        public int AlbumYear { get; set; }

        public override string ToString()
        {
            return $"[{Artist.Name} - {TrackTitle}]";
        }
    }
}
