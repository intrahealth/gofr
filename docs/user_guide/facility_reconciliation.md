# Facility Reconciliation

!!! important "What is the Facility Reconciliation?"
Facility Reconciliation reconciles data sources, which usually involves choosing a pair of sources to work with and then running the automatic or manual matching tool.

There are various features in this module. They include:

## Data sources

### Add Data Sources

GOFR supports various data sources including:

- CSV as a file source,
- Remote connections to DHIS2 and FHIR servers.
- Blank Sources

The following table displays the various fields required for each source to be added:

![Alt text](../img/data_sources.JPG 'GOFR Data Sources')

#### Upload CSV

The CSV file should have columns names in the first row of the file. Empty lines should be removed. The CSV file should be encoded as Unicode (utf-8) as that is what is used internally in the backend. If some entities are encoded in another format then matches that appear to be the same may not match as expected.

Latitude and longitude are optional columns. If they are included they will be used to facilitate manual matching but they are not used or required for automatic matching.

![type:video](../video/Upload_CSV_gofr.mp4)

**To upload a CSV:**

Select Data Sources -> Add Data Sources -> Select Upload CSV -> Select a file and enter the file name -> Continue

![Alt text](../img/upload_csv.JPG 'GOFR upload CSV')

The next step entails mapping the headers on the CSV file uploaded against the headers in the GOFR system:

**Match Headers**

Select the matching headers -> Click upload

![Alt text](../img/map_csv_header.JPG 'GOFR upload CSV')

The user may choose any levels in their hierarchy to include but they must be ordered with the top most level first.

Click on the + button to add more levels and map them to the appropriate levels in the app -> Upload

Ensure that all the column levels selected have data for all the facilities. The file will not be uploaded in case of missing data.

It is also possible to select no levels to match on a flat list with no hierarchy. To do so, don’t select levels.

On uploading, the following warning appears:

![Alt text](../img/upload_csv_warning.JPG 'GOFR upload CSV')

Click Proceed to continue uploading or click cancel, to discard.

#### Remote Data Source

GOFR supports remote sources of data. Any DHIS2 or FHIR server can be used as a source if the user has credentials to access it.

Extensive compatibility testing has not been performed but DHIS2 versions >=2.22 should be supported. Please contact the maintainers if there is an issue.

FHIR is supported for STU3 and R4 support is anticipated.

**To add a remote data source:**

Select Remote Source -> Fill in the source type -> Source name -> Base url -> Username -> Password -> Click Add

![Alt text](../img/upload_remote_source.JPG 'GOFR upload Remote Source')

After adding a remote source, users must run the synchronization so that the data can be pulled.

This is done in the view data sources feature.

View data sources -> remote sources -> select the data source and click force full sync.

#### Blank Source

Blank data sources can also be added. A blank data source can manually be populated with data by activating it on the dashboard and use the facility registry functionality to populate its contents

**To add a blank source:**

Select Blank Source> Add the name of the source -> Click Add

![Alt text](../img/add_blank_source.JPG 'GOFR view Blank Source')

### View Data Source

Once uploaded, you can view all the uploaded sources in the View tab.

![Alt text](../img/view_sources.JPG 'GOFR view Data Source')

#### Force full Sync

#### Sync Update

CSV entries can be edited. Any edits do not modify the original data source but the edits will be exported after reconciliation.

## Reconcile

Reconciling data sources involves choosing a pair of sources to work with and then running the automatic or manual matching GOFR. Any kind of match can be undone.

### Create and Manage Data Source Pair

To match/reconcile two data sources, you first need to create a data source pair. The source on the left (source 1) is the leader – the source of truth. The source on the right is the follower, the source that is meant to be cleaned.

To create a data source pair, On the Reconcile tab -> Select Create and Manage Data Source Pair page.

![Alt text](../img/create_data_source_pair.JPG 'GOFR Reconcile')

On the pair tab select one source on the left and one on the right.

In the pairing process it is possible to share the pair with another user who may join in helping to match, for example where they are familiar with a specific area.

### Automatic Reconcile

When the reconciliation process starts it uses automatic matching. Matching proceeds like this:

 <p>  The first level matches the highest administrative area names (termed region in GOFR) using the <a href="https://en.wikipedia.org/wiki/Levenshtein_distance"> Levenshtein distance.</a> </p>

![Alt text](../img/reconciling_level_one.JPG 'GOFR Reconciliation')

The second level matches based on the first level and also the Levenshtein distance for the second level names, termed district in GOFR.

![Alt text](../img/reconciling_level_two.JPG 'GOFR Reconciliation')

The final level matches based on the second level (which was already matched according to the level above it) as well as the Levenshtein distance.

![Alt text](../img/reconciling_level_three.JPG 'GOFR Reconciliation')

There is a detailed explanation of the processes:

![Alt text](../img/reconciling_help.JPG 'GOFR Reconciliation')

### Recalculate Scores

During the matching process at any level, it is possible to ask GOFR to match unmatched entities using the Recalculate Scores button. This process does not remove matches.

![Alt text](../img/recalculate_scores.JPG 'GOFR Reconciliation')

One common use for this is after manual matching of any entities, to rerun the matching process and incorporate the results. This can also be used when an entity is is freed for matching after having been previously flagged.

### Manual Matching

<p>  Manual matching brings up a dialog box to choose options. If latitude and longitude coordinates were provided in the data sources, it additionally scores matches based on the <a href="https://en.wikipedia.org/wiki/Haversine_formula"> haversine formula </a>for shortest path across a sphere (geodesic distance) between the points </p>

This is not used in the automatic matching but is provided for manual matching.

Any administrative area or facility match may be broken. If this is desired, click Recalculate Scores to rebuild the scoring index and manually match or flag as desired.

### Parent constraints

The default is to match facilities between sources based on hierarchies only. This means that if a facility is in the wrong nested administrative level, it will not be matched.

Under the Configure System tab the parent constraint can be disabled to allow for matching of all facilities across the sources.

![Alt text](../img/admin_configurations.JPG 'GOFR Reconciliation')

### Reconcile without levels

It is possible to match facilities from a flat list with no hierarchies.

### Notifications

When admins share a set of facilities for matching to a data manager, the data manager is notified by email when the matching is completed.

### Flagging

Flagging allows for an export of facilities that require further examination and research. When a flag is set, the user may also include a comment.

Flags may be set on any entity. For example, an organizational unit or a facility.

In order to see flagged items and their comments click the FLAGGED tab on the bottom of the RECONCILE menu for the level of interest. In this example, an org unit is flagged.

![Alt text](../img/flags.png 'GOFR Reconciliation')

Also in this example, once flagged, a facility or administrative unit may be released back for matching to another entity, or the match that was flagged may be confirmed.
