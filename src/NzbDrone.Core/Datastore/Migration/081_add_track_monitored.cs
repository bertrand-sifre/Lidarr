using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(081)]
    public class add_track_monitored : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Tracks").AddColumn("Monitored").AsBoolean().WithDefaultValue(false);

            // Create index for performance
            Create.Index().OnTable("Tracks").OnColumn("Monitored");

            // Set track monitoring based on parent album monitoring status (hierarchical)
            Execute.Sql(@"
                UPDATE Tracks
                SET Monitored = (
                    SELECT Albums.Monitored
                    FROM Albums
                    INNER JOIN AlbumReleases ON Albums.Id = AlbumReleases.AlbumId
                    WHERE AlbumReleases.Id = Tracks.AlbumReleaseId
                    LIMIT 1
                )
            ");
        }
    }
}
