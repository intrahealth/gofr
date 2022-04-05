# Partitions

!!! important "What is a Partition?"

A partition in GOFR refers to a data set that is stored separately from other sources and can be accessed and analysed individually.

Since GOFR allows the use of multiple data sources, partitioning ensures the integrity of each data set, while also allowing the merging of different datasets to create new data sets i.e new partitions

Data in gofr is loaded into a partition. Users may have access to one or many partitions, some of which they may own or be able to share. Admins may view all partitions.

To know what partition you are on, see the list on the top left, which allows switching partitions.

## How are partitions created in GOFR?

There are various ways of creating partitions in GOFR. They include:

1. **Uploading a CSV**- Uploading a CSV with relevant facility data into GOFR creates a partition with the data contained in the CSV

2. **Using a Remote Source** -If a user has credentials to access a DHIS2 or FHIR server, they can use it as a remote data source to populate data into GOFR, thereby creating a new partition

3. **Using a  Blank Source**- A partition can be created by addins a blank data source which is thereafter manually populated with data by activating it on the dashboard and use the facility registry functionality to populate its contents.

4. **Merging two data sources** - Using the Facility Reconciliation tool, once two data sources are merged, a new partition is created in GOFR, thereby allowing for manipulation / analysis of the partition as a new partition.


## Features of partitions

### **User specific** 

The creator of a data source is the default owner of the partition.The creator has full view, add/update and delete rights on the partition and has the options to share and revoke rights to the partition at will.

### **Shareable**

Once a partition is created, the creator (owner)can share it to other users who can collaborate/ add more info/ use the partition. 

### **Permissions**

####Issuing rights

The creator gives the rights to view, add/update the facilities, organizations, health services and jurisdictions at the point of sharing it with other users. A user can only share a partition which they own.

####Revoking rights

Permissions can also be revoked. The user can at any time revoke a specific permission/all permissions to any user they may have given the rights to at will.

## Active Partition

The active partition in GOFR is the partition which is in active use for a particular user in the system. This means that the visualizations,stats, the lists of facilities, organizations and services etc. displayed are those of the active partition for a particular user.

Once a different active partition is chosen, the information displayed automatically changes to the data contained in the chosen partition. A user cna change the active partitition by selecting a partition from the list of partitions he/she has access to in the system.

## Public Partition

The public partition refers to the partition which is shared to/viewed by the public. This partition is tied to a user with limited viewing only rights.

The public partition is activated by the system administator under the 'Configure system' tab.

## Partition Sharing

A partition owner(the creator of the partition) can share it with one or all other users, and assign specific permissions i.e

* View Facilities
* View Jurisdictions
* View Health Care services
* View Organization
* Update Facilities
* Update Jurisdictions
* Update Health Care services
* Update Organizations
