<template>
  <v-container fluid>
    <template v-if='$store.state.uploadRunning'><br><br><br>
      <v-alert
        type="info"
        :value="true"
      >
        <b>{{ $t(`App.hardcoded-texts.Wait for upload to finish`) }} ...</b>
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-alert>
    </template>
    <v-container
      fluid
      grid-list-lg
      v-if='!$store.state.denyAccess & !$store.state.uploadRunning'
    >
      <v-dialog
        v-model="$store.state.scoresProgressData.scoreDialog"
        hide-overlay
        persistent
        width="350"
      >
        <v-card
          color="white"
          dark
        >
          <v-card-text>
            <center>
              <font style="color:blue">{{$store.state.scoresProgressData.scoreProgressTitle}}</font><br>
              <v-progress-circular
                :rotate="-90"
                :size="100"
                :width="15"
                :value="$store.state.scoresProgressData.scoreProgressPercent"
                color="primary"
                v-if="$store.state.scoresProgressData.progressType == 'percent'"
              >
                <v-avatar
                  color="indigo"
                  size="50px"
                >
                  <span class="white--text">
                    <b>{{ $store.state.scoresProgressData.scoreProgressPercent }}%</b>
                  </span>
                </v-avatar>
              </v-progress-circular>
              <v-progress-linear
                indeterminate
                color="red"
                class="mb-0"
                v-if="$store.state.scoresProgressData.progressType == 'indeterminate'"
              ></v-progress-linear>
            </center>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog
        persistent
        v-model="alert"
        width="500px"
      >
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>
              {{alertTitle}}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            {{alertText}}
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="success"
              @click='alert = false'
            >{{ $t(`App.hardcoded-texts.OK`) }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        persistent
        v-model="flagCommentDialog"
        width="500px"
      >
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>
              {{ $t(`App.hardcoded-texts.Add comment for this flag if any`) }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-textarea
              v-model="flagComment"
              auto-grow
              filled
              color="deep-purple"
              :label="$t(`App.hardcoded-texts.Flag Comment`)"
              rows="1"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click='saveMatch'
            >{{ $t(`App.hardcoded-texts.Continue`) }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        persistent
        transition="scale-transition"
        v-model="dialog"
        :width="dialogWidth"
        height="auto"
      >
        <v-card :width='dialogWidth' height="auto">
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>
              {{ $t(`App.hardcoded-texts.Matching`) }} {{ selectedSource1Name }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="searchPotential"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              color="yellow"
            />
            <v-btn
              icon
              dark
              @click.native="back"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-title>
            {{ $t(`App.hardcoded-texts.Parents`) }}:
            <b>{{selectedSource1Parents | joinParentsAndReverse}}</b>
            <v-spacer></v-spacer>
            <template v-if='$store.state.recoLevel == $store.state.totalSource1Levels'>
              {{ $t(`App.hardcoded-texts.Latitude`) }}:
              <b>{{selectedSource1Lat}}</b>
              <v-spacer></v-spacer>
              {{ $t(`App.hardcoded-texts.Longitude`) }}:
              <b>{{selectedSource1Long}}</b>
              <v-spacer></v-spacer>
            </template>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="potentialHeaders"
              :items="allPotentialMatches"
              :search="searchPotential"
              class="elevation-1"
            >
              <template
                slot="headers"
              >
                <tr>
                  <template v-for='header in potentialHeaders'>
                    <th
                      :key='header.text'
                      align='left'
                      v-if="header.text == 'Score'"
                      class="column sortable active"
                      @click="changeSort(header.value)"
                    >
                      <v-icon
                        small
                        v-if="sort_arrow == 'up'"
                      >mdi-arrow-up</v-icon>
                      <v-icon
                        small
                        v-else
                      >mdi-arrow-down</v-icon>
                      {{ $t(`App.hardcoded-texts.${header.text}`) }}
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            icon
                          >
                            <v-icon>mdi-help</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t(`App.hardcoded-texts.The lower the score, the better the match`) }}</span>
                      </v-tooltip>
                    </th>
                    <th
                      :key='header.text'
                      align='left'
                      v-else
                    >
                      {{ $t(`App.hardcoded-texts.${header.text}`) }}
                    </th>
                  </template>
                </tr>
              </template>
              <template
                v-slot:item="{ item }"
              >
                <tr>
                  <td>
                    <v-row>
                      <v-col md="4">
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              color="error"
                              small
                              @click.native="match('flag', item.id, item.name, item.source2IdHierarchy, item.mappedParentName)"
                              v-on="on"
                            >
                              <v-icon
                                dark
                                left
                              >mdi-bell</v-icon>{{ $t(`App.hardcoded-texts.Flag`) }}
                            </v-btn>
                          </template>
                          <span>{{ $t(`App.hardcoded-texts.Mark the selected item as a match to be reviewed`) }}</span>
                        </v-tooltip>
                      </v-col>
                      <v-col md="4">
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              color="primary"
                              small
                              dark
                              @click.native="match('match', item.id, item.name, item.source2IdHierarchy)"
                              v-on="on"
                            >
                              <v-icon left>mdi-thumb-up</v-icon>{{ $t(`App.hardcoded-texts.Save Match`) }}
                            </v-btn>
                          </template>
                          <span>{{ $t(`App.hardcoded-texts.Save the selected item as a match`) }}</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </td>
                  <td>{{item.name}}</td>
                  <td>{{item.id}}</td>
                  <td>{{item.parents | joinParentsAndReverse}}</td>
                  <td v-if='$store.state.recoLevel == $store.state.totalSource1Levels'>{{item.geoDistance}}</td>
                  <td>{{item.score}}</td>
                  <td>{{potentialMatchComment(item)}}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions style='float: center'>
            <v-row>
              <v-col justify="1">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      color="green"
                      dark
                      @click.native="noMatch('nomatch')"
                      v-on="on"
                    >
                      <v-icon left>mdi-thumb-down</v-icon>{{ $t(`App.hardcoded-texts.No Match`) }}
                    </v-btn>
                  </template>
                  <span>{{ $t(`App.hardcoded-texts.Save this Source 1 location as having no match`) }}</span>
                </v-tooltip>
              </v-col>
              <v-col justify="1">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      color="error"
                      dark
                      @click.native="noMatch('ignore')"
                      v-on="on"
                    >
                      <v-icon left>mdi-thumb-down</v-icon>{{ $t(`App.hardcoded-texts.Ignore`) }}
                    </v-btn>
                  </template>
                  <span>{{ $t(`App.hardcoded-texts.Mark this source 1 location as being ignored`) }}</span>
                </v-tooltip>
              </v-col>
              <v-col justify="5">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-if='potentialAvailable'
                      color="teal darken-6"
                      style="color: white"
                      v-on="on"
                      @click="showAllPotential = !showAllPotential"
                    >
                      <template v-if="showAllPotential">Show Scored Suggestions</template>
                      <template v-else>
                        <v-icon left>mdi-eye</v-icon>
                        {{ $t(`App.hardcoded-texts.Show All Suggestions`) }}
                      </template>
                    </v-btn>
                  </template>
                  <span v-if="showAllPotential">{{ $t(`App.hardcoded-texts.Limit to only scored suggestions`) }}</span>
                  <span v-else>{{ $t(`App.hardcoded-texts.See all possible choices ignoring the score`) }}</span>
                </v-tooltip>
              </v-col>
              <v-col justify="7">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      color="orange darken-2"
                      @click.native="back"
                      style="color: white"
                      v-on="on"
                    >
                      <v-icon
                        dark
                        left
                      >mdi-arrow-left</v-icon>{{ $t(`App.hardcoded-texts.Back`) }}
                    </v-btn>
                  </template>
                  <span>{{ $t(`App.hardcoded-texts.Return without saving`) }}</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-layout
        row
        wrap
      >
        <v-flex xs3>
          <appRecoExport></appRecoExport>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs2>
          <b>{{ $t(`App.hardcoded-texts.Reconciling`) }} {{currentLevelText}}</b>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex
          xs1
          sm2
          md2
          right
        >
          <v-select
            :items="$store.state.levelArray"
            v-model="$store.state.recoLevel"
            :item-value='$store.state.levelArray.value'
            :item-name='$store.state.levelArray.text'
            :label="$t(`App.hardcoded-texts.Level`)"
            single-line
            @change="levelChanged"
          >
          </v-select>
        </v-flex>
        <v-flex xs2>
          <template v-if='!$store.state.scoreSavingProgressData.savingMatches'>
            <template>
              <v-btn
                color="primary"
                dark
                @click="getScores(false)"
                rounded
              >
                <v-icon>mdi-repeat-once</v-icon> {{ $t(`App.hardcoded-texts.Recalculate Scores`) }}
              </v-btn>
            </template>
          </template>
          <template v-else>
            {{ $t(`App.hardcoded-texts.Saving matches for`) }} {{translateDataHeader('source1', $store.state.recoLevel - 1)}}
            <v-progress-linear
              v-if='!saveProgressTimedout'
              color="error"
              width="20"
              height="20"
              :value="$store.state.scoreSavingProgressData.percent"
            >
              <center>
                <span class="green--text"><b>{{$store.state.scoreSavingProgressData.percent}}%</b></span>
              </center>
            </v-progress-linear>
            <v-progress-linear
              v-else
              indeterminate
              color="red"
            ></v-progress-linear>
          </template>
        </v-flex>
        <v-flex
          xs1
          text-xs-right
        >
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                class="mx-1"
                fab
                dark
                x-small
                color="primary"
                @click="helpDialog = true"
                v-on="on"
              >
                <v-icon>mdi-help</v-icon>
              </v-btn>
            </template>
            <span>{{ $t(`App.hardcoded-texts.Help`) }}</span>
          </v-tooltip>
        </v-flex>
      </v-layout>
      <v-dialog
        v-model="helpDialog"
        scrollable
        persistent
        :overlay="false"
        max-width="700px"
        transition="dialog-transition"
      >
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>
              <v-icon>mdi-information</v-icon> {{ $t(`App.hardcoded-texts.About this page`) }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              icon
              dark
              @click.native="helpDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            {{ $t(`App.hardcoded-texts.This page let you map source 1 data with those in source2`) }}
            <v-list>
              1. {{ $t(`App.hardcoded-texts.Source 1 refer to the data source name selected as source 1 under data source pair section`) }}
            </v-list>
            <v-list>
              2. {{ $t(`App.hardcoded-texts.Source 2 refer to the data source name selected as source 2 under data source pair section`) }}
            </v-list>
            <v-list>
              3. {{ $t(`App.hardcoded-texts.After breaking a match, you will need to recalculate scores for the app to load potential matches of the broken location`) }}
            </v-list>
            <v-list>
              4. {{ $t(`App.hardcoded-texts.FLAGGED Locations are the locations that will need to be reviewed before they are saved as matches`) }}
            </v-list>
            <v-list>
              5. {{ $t(`App.hardcoded-texts.NO MATCHES - these are locations that do not matches anything from source 2`) }}
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-layout
        row
        wrap
      >
        <v-flex
          xs2
          right
        >
          <div style="border-style: solid;border-color:green; text-align: center;">
            <b>{{ $t(`App.hardcoded-texts.Source 1 Reconciliation Status`) }}</b>

            <v-layout
              row
              wrap
            >
              <v-flex xs6>
                <v-layout column>
                  <v-flex>
                    <b>{{ $t(`App.hardcoded-texts.Matched`) }}</b>
                  </v-flex>
                  <v-flex align-center>
                    <center>
                      <b>{{source1TotalMatched}}/{{source1TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex>
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source1PercentMatched"
                        color="green"
                      >
                        <font color="black">
                          <b>{{ source1PercentMatched }}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs6>
                <v-layout column>
                  <v-flex align-center>
                    <b>{{ $t(`App.hardcoded-texts.Unmatched`) }}</b>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <b>{{source1TotalUnMatched}}/{{source1TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source1PercentUnMatched"
                        color="red"
                      >
                        <font color="black">
                          <b>{{source1PercentUnMatched}}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
            <v-layout
              row
              wrap
            >
              <v-flex xs6>
                <v-layout column>
                  <v-flex align-center>
                    <b>{{ $t(`App.hardcoded-texts.Flagged`) }}</b>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <b>{{totalFlagged}}/{{source1TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source1PercentFlagged"
                        color="orange"
                      >
                        <font color="black">
                          <b>{{source1PercentFlagged}}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs6>
                <v-layout column>
                  <v-flex align-center>
                    <b>{{ $t(`App.hardcoded-texts.No Match`) }}</b>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <b>{{source1TotalNoMatch}}/{{source1TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source1PercentNoMatch"
                        color="red"
                      >
                        <font color="black">
                          <b>{{source1PercentNoMatch}}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </div>
        </v-flex>
        <v-flex
          xs4
          child-flex
        >
          <v-card color="green lighten-2">
            <v-card-title primary-title>
              {{ $t(`App.hardcoded-texts.Source 1 Unmatched`) }}
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchUnmatchedSource1"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <template v-if='!loadingSource1Unmatched'>
              <liquor-tree
                :data="source1Tree"
                ref="source1Tree"
                :key="source1TreeUpdate"
              />
              <v-data-table
                :headers="source1GridHeaders"
                :items="source1Grid"
                :search="searchUnmatchedSource1"
                light
                class="elevation-1"
              >
                <template
                  v-slot:item="{ item }"
                >
                  <tr>
                    <td
                      v-if="$store.state.recoStatus === 'Done'"
                      :key='item.id'
                    >{{item.name}}</td>
                    <td
                      v-else
                      @click="getPotentialMatch(item.id)"
                      style="cursor: pointer"
                      :key='item.id'
                    >{{item.name}}</td>
                    <td
                      v-for="(parent,index) in item.parents"
                      :key='item.id+index'
                    >
                      <template v-if='index != item.parents.length-1'>
                        {{parent}}
                      </template>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </template>
            <template v-else>
              <v-progress-linear
                :size="70"
                indeterminate
                color="amber"
              ></v-progress-linear>
            </template>
          </v-card>
        </v-flex>
        <v-flex xs4>
          <v-card
            color="blue lighten-2"
            dark
          >
            <v-card-title primary-title>
              {{ $t(`App.hardcoded-texts.Source 2 Unmatched`) }}
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchUnmatchedSource2"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <template v-if='!loadingSource2Unmatched'>
              <v-data-table
                :headers="source1UnmatchedHeaders"
                :items="$store.state.source2UnMatched"
                :search="searchUnmatchedSource2"
                light
                class="elevation-1"
              >
                <template
                  v-slot:item="{ item }"
                >
                  <tr>
                    <td>{{item.name}} <br>&ensp;&ensp;{{item.parents | joinParentsAndReverse}}</td>
                  </tr>
                </template>
              </v-data-table>
            </template>
            <template v-else>
              <v-progress-linear
                :size="70"
                indeterminate
                color="amber"
              ></v-progress-linear>
            </template>
          </v-card>
        </v-flex>

        <v-flex
          xs2
          right
        >
          <div style='border-style: solid;border-color: green; text-align: center;'>
            <b>{{ $t(`App.hardcoded-texts.Source 2 Reconciliation Status`) }}</b>
            <v-layout
              row
              wrap
            >
              <v-flex xs6>
                <v-layout column>
                  <v-flex align-center>
                    <b>{{ $t(`App.hardcoded-texts.Matched`) }}</b>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <b>{{source2TotalMatched}}/{{source2TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source2PercentMatched"
                        color="green"
                      >
                        <font color="black">
                          <b>{{source2PercentMatched}}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs6>
                <v-layout column>
                  <v-flex xs1>
                    <b>{{ $t(`App.hardcoded-texts.Unmatched`) }}</b>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <b>{{source2TotalUnmatched}}/{{source2TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source2PercentUnmatched"
                        color="red"
                      >
                        <font color="black">
                          <b>{{ source2PercentUnmatched }}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
            <v-layout
              row
              wrap
            >
              <v-flex xs6>
                <v-layout column>
                  <v-flex align-center>
                    <b>{{ $t(`App.hardcoded-texts.Flagged`) }}</b>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <b>{{totalFlagged}}/{{source2TotalRecords}}</b>
                    </center>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source2PercentFlagged"
                        color="orange"
                      >
                        <font color="black">
                          <b>{{source2PercentFlagged}}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs6>
                <v-layout column>
                  <v-flex align-center>
                    <b>{{ $t(`App.hardcoded-texts.Not in Source 1`) }}</b>
                  </v-flex>
                  <v-flex xs1>
                    <center>
                      <b>{{source2NotInSource1}}</b>
                    </center>
                  </v-flex>
                  <v-flex
                    xs1
                    align-center
                  >
                    <center>
                      <v-progress-circular
                        :rotate="-90"
                        :size="65"
                        :width="8"
                        :value="source2PercentNotInSource1"
                        color="red"
                      >
                        <font color="black">
                          <b>{{source2PercentNotInSource1}}%</b>
                        </font>
                      </v-progress-circular>
                    </center>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </div>
        </v-flex>
      </v-layout>
      <v-layout
        column
        wrap
      >
        <v-tabs
          icons-and-text
          centered
          grow
          dark
          background-color="cyan"
        >
          <v-tabs-slider color="red"></v-tabs-slider>
          <v-tab key="match">
            {{ $t(`App.hardcoded-texts.MATCHED`) }} ({{source1TotalMatched}})
            <v-icon
              color="white"
              right
            >mdi-thumb-up</v-icon>
          </v-tab>
          <v-tab key="nomatch">
            {{ $t(`App.hardcoded-texts.NO MATCH`) }} ({{source1TotalNoMatch}})
            <v-icon
              color="white"
              right
            >mdi-thumb-down</v-icon>
          </v-tab>
          <v-tab key="ignore">
            {{ $t(`App.hardcoded-texts.IGNORED`) }} ({{source1TotalIgnore}})
            <v-icon
              color="white"
              right
            >mdi-thumb-down</v-icon>
          </v-tab>
          <v-tab key="flagged">
            {{ $t(`App.hardcoded-texts.FLAGGED`) }} ({{totalFlagged}})
            <v-icon
              color="white"
              right
            >mdi-bell</v-icon>
          </v-tab>
          <v-tab-item key="match">
            <template v-if='$store.state.matchedContent != null'>
              <v-text-field
                v-model="searchMatched"
                append-icon="mdi-magnify"
                :label="$t(`App.hardcoded-texts.Search`)"
                single-line
                hide-details
              ></v-text-field>
              <v-data-table
                :headers="matchedHeaders"
                :items="$store.state.matchedContent"
                :search="searchMatched"
                class="elevation-1"
              >
                <template
                  v-slot:item="{ item }"
                >
                  <tr>
                    <td>{{item.source1Name}}</td>
                    <td>{{item.source1Id}}</td>
                    <td>{{item.source2Name}}</td>
                    <td>
                      <v-treeview :items="item.source2IdHierarchy" />
                    </td>
                    <td v-if='item.matchComments'>{{item.matchComments.join(', ')}}</td>
                    <td v-else></td>
                    <td>
                      <v-btn
                        v-if="$store.state.recoStatus == 'Done'"
                        disabled
                        color="error"
                        style='text-transform: none'
                        small
                        @click='breakMatch(item.source1Id)'
                      >
                        <v-icon>mdi-undo</v-icon>{{ $t(`App.hardcoded-texts.Break Match`) }}
                      </v-btn>
                      <v-btn
                        v-else
                        color="error"
                        style='text-transform: none'
                        small
                        @click='breakMatch(item.source1Id)'
                      >
                        <v-icon>mdi-undo</v-icon>{{ $t(`App.hardcoded-texts.Break Match`) }}
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </template>
            <template v-else>
              <v-progress-linear
                :size="70"
                indeterminate
                color="amber"
              ></v-progress-linear>
            </template>
          </v-tab-item>
          <v-tab-item key="nomatch">
            <template v-if='$store.state.noMatchContent != null'>
              <v-text-field
                v-model="searchNotMatched"
                append-icon="mdi-magnify"
                :label="$t(`App.hardcoded-texts.Search`)"
                single-line
                hide-details
              ></v-text-field>
              <v-data-table
                :headers="noMatchHeaders"
                :items="$store.state.noMatchContent"
                :search="searchNotMatched"
                class="elevation-1"
              >
                <template
                  v-slot:item="{ item }"
                >
                  <tr>
                    <td>{{item.source1Name}}</td>
                    <td>{{item.source1Id}}</td>
                    <td>{{item.parents.join('->')}}</td>
                    <td>
                      <v-btn
                        v-if="$store.state.recoStatus == 'Done'"
                        disabled
                        color="error"
                        style='text-transform: none'
                        small
                        @click='breakNoMatch(item.source1Id, "nomatch")'
                      >
                        <v-icon>mdi-cached</v-icon>{{ $t(`App.hardcoded-texts.Break No Match`) }}
                      </v-btn>
                      <v-btn
                        v-else
                        color="error"
                        style='text-transform: none'
                        small
                        @click='breakNoMatch(item.source1Id, "nomatch")'
                      >
                        <v-icon>mdi-cached</v-icon>{{ $t(`App.hardcoded-texts.Break No Match`) }}
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </template>
            <template v-else>
              <v-progress-linear
                :size="70"
                indeterminate
                color="amber"
              ></v-progress-linear>
            </template>
          </v-tab-item>
          <v-tab-item key="ignore">
            <template v-if='$store.state.ignoreContent != null'>
              <v-text-field
                v-model="searchIgnore"
                append-icon="mdi-magnify"
                :label="$t(`App.hardcoded-texts.Search`)"
                single-line
                hide-details
              ></v-text-field>
              <v-data-table
                :headers="noMatchHeaders"
                :items="$store.state.ignoreContent"
                :search="searchIgnore"
                class="elevation-1"
              >
                <template
                  v-slot:item="{ item }"
                >
                  <td>{{item.source1Name}}</td>
                  <td>{{item.source1Id}}</td>
                  <td>{{item.parents.join('->')}}</td>
                  <td>
                    <v-btn
                      v-if="$store.state.recoStatus == 'Done'"
                      disabled
                      color="error"
                      style='text-transform: none'
                      small
                      @click='breakNoMatch(item.source1Id, "ignore")'
                    >
                      <v-icon>mdi-cached</v-icon>{{ $t(`App.hardcoded-texts.Break Ignore`) }}
                    </v-btn>
                    <v-btn
                      v-else
                      color="error"
                      style='text-transform: none'
                      small
                      @click='breakNoMatch(item.source1Id, "ignore")'
                    >
                      <v-icon>mdi-cached</v-icon>{{ $t(`App.hardcoded-texts.Break Ignore`) }}
                    </v-btn>
                  </td>
                </template>
              </v-data-table>
            </template>
            <template v-else>
              <v-progress-linear
                :size="70"
                indeterminate
                color="amber"
              ></v-progress-linear>
            </template>
          </v-tab-item>
          <v-tab-item key="flagged">
            <template v-if='$store.state.flagged != null'>
              <v-text-field
                v-model="searchFlagged"
                append-icon="mdi-magnify"
                :label="$t(`App.hardcoded-texts.Search`)"
                single-line
                hide-details
              ></v-text-field>
              <v-data-table
                :headers="flaggedHeaders"
                :items="$store.state.flagged"
                :search="searchFlagged"
                class="elevation-1"
              >
                <template
                  v-slot:item="{ item }"
                >
                  <tr>
                    <td>{{item.source1Name}}</td>
                    <td>{{item.source1Id}}</td>
                    <td>{{item.source2Name}}</td>
                    <td>
                      <v-treeview :items="item.source2IdHierarchy" />
                    </td>
                    <td>{{item.flagComment}}</td>
                    <td>
                      <v-btn
                        v-if="$store.state.recoStatus == 'Done'"
                        disabled
                        color="primary"
                        style='text-transform: none'
                        small
                        @click='acceptFlag(item.source1Id)'
                      >
                        <v-icon>mdi-thumb-up</v-icon>{{ $t(`App.hardcoded-texts.Confirm Match`) }}
                      </v-btn>
                      <v-btn
                        v-else
                        color="primary"
                        style='text-transform: none'
                        small
                        @click='acceptFlag(item.source1Id)'
                      >
                        <v-icon>mdi-thumb-up</v-icon>{{ $t(`App.hardcoded-texts.Confirm Match`) }}
                      </v-btn>
                      <v-btn
                        v-if="$store.state.recoStatus == 'Done'"
                        disabled
                        color="error"
                        style='text-transform: none'
                        small
                        @click='unFlag(item.source1Id)'
                      >
                        <v-icon>mdi-cached</v-icon>{{ $t(`App.hardcoded-texts.Release`) }}
                      </v-btn>
                      <v-btn
                        v-else
                        color="error"
                        style='text-transform: none'
                        small
                        @click='unFlag(item.source1Id)'
                      >
                        <v-icon>mdi-cached</v-icon>{{ $t(`App.hardcoded-texts.Release`) }}
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </template>
            <template v-else>
              <v-progress-linear
                :size="70"
                indeterminate
                color="amber"
              />
            </template>
          </v-tab-item>
        </v-tabs>
      </v-layout>
      <v-layout>
        <v-flex
          xs1
          sm4
          md2
          v-if="goNextLevel == 'yes' && !$store.state.scoreSavingProgressData.savingMatches"
        >
          <v-btn
            color="primary"
            rounded
            @click='levelChanged($store.state.recoLevel+1)'
          >
            <v-icon>mdi-forward</v-icon>{{ $t(`App.hardcoded-texts.Proceed to`) }} {{nextLevelText}}
          </v-btn>
        </v-flex>
        <v-flex
          xs1
          sm4
          md2
          v-if="lastLevelDone == 'yes'"
        >
          <v-btn
            color="primary"
            rounded
            @click='$router.push({name:"FacilityRecoStatus"})'
          >
            <v-icon>mdi-view-dashboard</v-icon>{{ $t(`App.hardcoded-texts.Reconciliation Status`) }}
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>
<script>
import axios from 'axios'
import LiquorTree from 'liquor-tree'
import { scoresMixin } from '../mixins/scoresMixin'
import { generalMixin } from '../mixins/generalMixin'
import { eventBus } from '../main'
import ReconciliationExport from './ReconciliationExport'

export default {
  mixins: [scoresMixin, generalMixin],
  data () {
    return {
      clientId: '',
      flagCommentDialog: false,
      flagComment: '',
      helpDialog: false,
      type: '',
      source2Id: '',
      source2Name: '',
      sort_arrow: 'up',
      pagination: { sortBy: 'score' },
      recoLevel: 0,
      searchUnmatchedSource2: '',
      searchUnmatchedSource1: '',
      searchPotential: '',
      searchMatched: '',
      searchNotMatched: '',
      searchIgnore: '',
      searchFlagged: '',
      potentialMatches: [],
      showAllPotential: false,
      alertText: '',
      alertTitle: '',
      alert: false,
      saveProgressTimedout: false,
      source1Parents: {},
      source1Filter: { text: '', level: '' },
      source1TreeUpdate: 0,
      selectedSource1: {},
      selectedSource1Name: null,
      selectedSource1Id: null,
      selectedSource1Lat: null,
      selectedSource1Long: null,
      selectedSource1Parents: [],
      dialog: false,
      dialogWidth: '',
      source1UnmatchedHeaders: [{ text: this.$t(`App.hardcoded-texts.Location`), value: 'name' }],
      noMatchHeaders: [
        { text: this.$t(`App.hardcoded-texts.Source1 Location`), value: 'source1Name' },
        { text: this.$t(`App.hardcoded-texts.Source1 ID`), value: 'source1Id' },
        { text: this.$t(`App.hardcoded-texts.Parents`), value: 'parents' }
      ],
      flaggedHeaders: [
        { text: this.$t(`App.hardcoded-texts.Source1 Location`), value: 'source1Name' },
        { text: this.$t(`App.hardcoded-texts.Source1 ID`), value: 'source1Id' },
        { text: this.$t(`App.hardcoded-texts.Source2 Location`), value: 'source2Name' },
        { text: this.$t(`App.hardcoded-texts.Source2 ID`), value: 'source2Id' },
        { text: this.$t(`App.hardcoded-texts.Comment`), value: 'flagComment' }
      ]
    }
  },
  filters: {
    removeCountry (parents) {
      var parentsCopy = parents.slice(0)
      parentsCopy.splice(parentsCopy.length - 1, 1)
      return parentsCopy
    },
    joinParents (parents) {
      return parents.join('->')
    },
    joinParentsAndReverse (parents) {
      return [...parents].reverse().join('->')
    }
  },
  methods: {
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
      if (this.pagination.descending) {
        this.sort_arrow = 'mdi-down'
      } else {
        this.sort_arrow = 'mdi-up'
      }
    },
    addListener () {
      const setListener = () => {
        if (this.$refs && this.$refs.source1Tree) {
          this.$refs.source1Tree.$on('node:selected', node => {
            this.source1Filter.text = node.data.text
            let level = 1
            while (node.parent) {
              node = node.parent
              level++
            }
            this.source1Filter.level = level
          })
        } else {
          setTimeout(function () {
            setListener()
          }, 500)
        }
      }
      setListener()
    },
    levelChanged (level) {
      if (this.$store.state.recoLevel === level) {
        return
      }
      this.$store.state.recoLevel = level
      this.getScores(false)
      if (
        this.$store.state.recoLevel === this.$store.state.totalSource1Levels
      ) {
        this.dialogWidth = '1460px'
      } else {
        this.dialogWidth = '1190px'
      }
    },
    getBuildingPotentialMatches (id) {
      this.potentialMatches = []
      let recoLevel = this.$store.state.recoLevel
      let totalSource1Levels = this.$store.state.totalSource1Levels
      let totalSource2Levels = this.$store.state.totalSource2Levels
      if (this.clientId) {
        let lastChar = this.clientId[this.clientId.length - 1]
        lastChar = parseInt(lastChar)
        lastChar += 1
        this.clientId += lastChar
      } else {
        let lastChar = this.$store.state.clientId[this.$store.state.clientId.length - 1]
        lastChar = parseInt(lastChar)
        lastChar += 1
        this.clientId = this.$store.state.clientId + lastChar
      }

      let userID = this.$store.state.activePair.userID
      let source1LimitOrgId = this.getLimitOrgIdOnActivePair().source1LimitOrgId
      let source2LimitOrgId = this.getLimitOrgIdOnActivePair().source2LimitOrgId
      source1LimitOrgId = JSON.stringify(source1LimitOrgId)
      source2LimitOrgId = JSON.stringify(source2LimitOrgId)
      let parentConstraint = JSON.stringify(
        this.$store.state.config.generalConfig.reconciliation.parentConstraint
      )
      let partition1 = this.$store.state.activePair.source1.name
      let partition2 = this.$store.state.activePair.source2.name
      let mappingPartition = this.$store.state.activePair.name
      let path = `id=${id}&partition1=${partition1}&partition2=${partition2}&mappingPartition=${mappingPartition}`
      path += `&source1LimitOrgId=${source1LimitOrgId}&source2LimitOrgId=${source2LimitOrgId}&totalSource1Levels=${totalSource1Levels}&totalSource2Levels=${totalSource2Levels}`
      path += `&recoLevel=${recoLevel}&clientId=${this.clientId}&userID=${userID}&parentConstraint=${parentConstraint}&getPotential=${true}`
      this.$store.state.dynamicProgress = true
      this.$store.state.progressTitle = 'Getting potential matches from server'
      axios
        .get('/match/reconcile/?' + path)
        .then(response => {
          this.$store.state.dynamicProgress = false
          if (response.data) {
            let scores = JSON.parse(response.data).responseData.scoreResults
            if (scores.length > 0) {
              let matches = scores[0]
              const exactMatches = matches.exactMatch
              if (Object.keys(exactMatches).length > 0) {
                this.$store.state.dialogError = true
                this.$store.state.errorDescription = 'This location is already mapped, please recalculate scores to get changes'
                this.$store.state.errorTitle = 'Info'
                this.$store.state.errorColor = 'error'
                return
              }
              this.selectedSource1 = matches.source1
              this.selectedSource1Name = matches.source1.name
              this.selectedSource1Parents = matches.source1.parents
              this.selectedSource1Lat = matches.source1.lat
              this.selectedSource1Long = matches.source1.long
              this.selectedSource1Id = matches.source1.id
              for (let score in matches.potentialMatches) {
                for (let j in matches.potentialMatches[score]) {
                  let potentials = matches.potentialMatches[score][j]
                  var matched = this.$store.state.matchedContent.find(
                    matched => {
                      return matched.source2Id === potentials.id
                    }
                  )
                  var flagged = this.$store.state.flagged.find(flagged => {
                    return flagged.source2Id === potentials.id
                  })
                  if (matched) {
                    continue
                  }
                  if (flagged) {
                    continue
                  }
                  this.potentialMatches.push({
                    score: score,
                    name: potentials.name,
                    id: potentials.id,
                    source2IdHierarchy: potentials.source2IdHierarchy,
                    lat: potentials.lat,
                    long: potentials.long,
                    geoDistance: potentials.geoDistance,
                    parents: potentials.parents,
                    mappedParentName: potentials.mappedParentName
                  })
                }
              }
            }
            this.dialog = true
          } else {
            this.dialog = true
          }
        })
        .catch(error => {
          if(!error.response) {
            console.error(error);
            this.getBuildingPotentialMatches(id)
          } else {
            this.flagComment = ''
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = error.response.data.error
            this.dialog = false
          }
        })
    },
    getJurisdictionPotentialMatches (id) {
      this.potentialMatches = []
      this.showAllPotential = false
      for (let scoreResult of this.$store.state.scoreResults) {
        if (scoreResult.source1.id === id) {
          this.selectedSource1 = scoreResult.source1
          this.selectedSource1Name = scoreResult.source1.name
          this.selectedSource1Parents = scoreResult.source1.parents
          this.selectedSource1Lat = scoreResult.source1.lat
          this.selectedSource1Long = scoreResult.source1.long
          this.selectedSource1Id = scoreResult.source1.id
          for (let score in scoreResult.potentialMatches) {
            for (let j in scoreResult.potentialMatches[score]) {
              let potentials = scoreResult.potentialMatches[score][j]
              var matched = this.$store.state.matchedContent.find(matched => {
                return matched.source2Id === potentials.id
              })
              var flagged = this.$store.state.flagged.find(flagged => {
                return flagged.source2Id === potentials.id
              })
              if (matched) {
                continue
              }
              if (flagged) {
                continue
              }
              this.potentialMatches.push({
                score: score,
                name: potentials.name,
                id: potentials.id,
                source2IdHierarchy: potentials.source2IdHierarchy,
                lat: potentials.lat,
                long: potentials.long,
                geoDistance: potentials.geoDistance,
                parents: potentials.parents,
                mappedParentName: potentials.mappedParentName
              })
            }
          }
        }
      }
      this.dialog = true
    },
    getPotentialMatch (id) {
      this.getBuildingPotentialMatches(id)
    },
    potentialMatchComment (potentialMatch) {
      let comment = ''
      // check if ID different
      if (this.$store.state.recoLevel === this.$store.state.totalSource1Levels) {
        let source1IDs = []
        let source2IDs = []
        if (this.selectedSource1.source1IdHierarchy) {
          source1IDs.push(this.selectedSource1.source1IdHierarchy[0].id)
          for (let child of this.selectedSource1.source1IdHierarchy[0].children) {
            source1IDs.push(child.id)
          }
        }
        if (potentialMatch.source2IdHierarchy) {
          source2IDs.push(potentialMatch.source2IdHierarchy[0].id)
          for (let child of potentialMatch.source2IdHierarchy[0].children) {
            source2IDs.push(child.id)
          }
        }

        let exist = source1IDs.some(id1 => source2IDs.indexOf(id1) >= 0)
        if (!exist) {
          if (comment) {
            comment += ', '
          }
          comment += 'ID differ'
        }
      }

      // check if names are different
      if (potentialMatch.name.toLowerCase() !== this.selectedSource1.name.toLowerCase()) {
        if (comment) {
          comment += ', '
        }
        comment += 'Names differ'
      }

      // check if parents are different
      const source2Parent = potentialMatch.mappedParentName
      const source1Parent = this.selectedSource1.parents[0]
      if (source1Parent !== source2Parent) {
        if (comment) {
          comment += ', '
        }
        comment += 'Parents differ'
      }

      return comment
    },
    match (type, source2Id, source2Name, source2IdHierarchy, mappedParentName) {
      this.matchType = type
      this.source2Id = source2Id
      this.source2Name = source2Name
      this.source2IdHierarchy = source2IdHierarchy
      this.mappedParentName = mappedParentName
      if (source2Id === null) {
        this.alert = true
        this.alertTitle = 'Information'
        this.alertText = 'Select Source 2 Location to match against Source 1 Location'
        return
      }
      if (type === 'flag') {
        this.flagCommentDialog = true
      } else {
        this.saveMatch()
      }
    },
    saveMatch () {
      this.flagCommentDialog = false
      this.$store.state.progressTitle = 'Saving match'
      this.$store.state.dynamicProgress = true
      let partition1 = this.$store.state.activePair.source1.name
      let partition2 = this.$store.state.activePair.source2.name
      let mappingPartition = this.$store.state.activePair.name
      let formData = new FormData()
      formData.append('source1Id', this.selectedSource1Id)
      formData.append('source2Id', this.source2Id)
      formData.append('flagComment', this.flagComment)
      formData.append('partition1', partition1)
      formData.append('partition2', partition2)
      formData.append('mappingPartition', mappingPartition)
      formData.append('recoLevel', this.$store.state.recoLevel)
      formData.append('totalLevels', this.$store.state.totalSource1Levels)
      formData.append('pairId', this.$store.state.activePair.id)
      axios
        .post('/match/performMatch/' + this.matchType, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(response => {
          this.$store.state.dynamicProgress = false
          // remove from Source 2 Unmatched
          let source2Parents = null
          for (let k in this.$store.state.source2UnMatched) {
            if (this.$store.state.source2UnMatched[k].id === this.source2Id) {
              source2Parents = this.$store.state.source2UnMatched[k].parents
              this.$store.state.source2UnMatched.splice(k, 1)
            }
          }

          // Add from a list of Source 1 Matched and remove from list of Source 1 unMatched
          for (let k in this.$store.state.source1UnMatched) {
            if (this.$store.state.source1UnMatched[k].id === this.selectedSource1Id) {
              if (this.matchType === 'match') {
                ++this.$store.state.totalAllMapped
                this.$store.state.matchedContent.push({
                  source1Name: this.selectedSource1Name,
                  source1Id: this.selectedSource1Id,
                  source1Parents: this.$store.state.source1UnMatched[k].parents,
                  source2Name: this.source2Name,
                  source2Id: this.source2Id,
                  source2IdHierarchy: this.source2IdHierarchy,
                  mappedParentName: this.mappedParentName,
                  source2Parents: source2Parents,
                  matchComments: response.data.matchComments
                })
              } else if (this.matchType === 'flag') {
                ++this.$store.state.totalAllFlagged
                this.$store.state.flagged.push({
                  source1Name: this.selectedSource1Name,
                  source1Id: this.selectedSource1Id,
                  source1Parents: this.$store.state.source1UnMatched[k].parents,
                  source2Name: this.source2Name,
                  source2Id: this.source2Id,
                  source2IdHierarchy: this.source2IdHierarchy,
                  mappedParentName: this.mappedParentName,
                  source2Parents: source2Parents,
                  flagComment: this.flagComment
                })
              }
              this.$store.state.source1UnMatched.splice(k, 1)
            }
          }
          this.flagComment = ''
          this.selectedSource1Id = null
          this.selectedSource1Name = null
          this.dialog = false
        })
        .catch(err => {
          if(!err.response) {
            console.error(err);
            this.saveMatch()
          } else {
            this.flagComment = ''
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = err.response.data.error
            this.selectedSource1Id = null
            this.selectedSource1Name = null
            this.dialog = false
          }
        })
    },
    acceptFlag (source1Id) {
      this.$store.state.progressTitle = 'Accepting flag'
      this.$store.state.dynamicProgress = true
      let formData = new FormData()
      formData.append('source1Id', source1Id)
      formData.append('pairId', this.$store.state.activePair.id)
      let mappingPartition = this.$store.state.activePair.name
      axios
        .post('/match/acceptFlag/' + mappingPartition, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(() => {
          this.$store.state.dynamicProgress = false
          // Add from a list of Source 1 Matched and remove from list of Flagged
          for (let k in this.$store.state.flagged) {
            if (this.$store.state.flagged[k].source1Id === source1Id) {
              this.$store.state.matchedContent.push({
                source1Name: this.$store.state.flagged[k].source1Name,
                source1Id: this.$store.state.flagged[k].source1Id,
                source1Parents: this.$store.state.flagged[k].source1Parents,
                source2Name: this.$store.state.flagged[k].source2Name,
                source2Id: this.$store.state.flagged[k].source2Id,
                source2IdHierarchy: this.$store.state.flagged[k].source2IdHierarchy,
                mappedParentName: this.$store.state.flagged[k].mappedParentName,
                source2Parents: this.$store.state.flagged[k].source2Parents
              })
              this.$store.state.flagged.splice(k, 1)
              ++this.$store.state.totalAllMapped
              --this.$store.state.totalAllFlagged
            }
          }
        })
        .catch(err => {
          if(!err.response) {
            console.error(err);
            this.acceptFlag(source1Id)
          } else {
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = err.response.data.error
            this.selectedSource1Id = null
            this.selectedSource1Name = null
            this.dialog = false
            console.log(err)
          }
        })
    },
    breakMatch (source1Id) {
      this.$store.state.progressTitle = 'Breaking match'
      this.$store.state.dynamicProgress = true
      let formData = new FormData()
      let partition1 = this.$store.state.activePair.source1.name
      let partition2 = this.$store.state.activePair.source2.name
      let mappingPartition = this.$store.state.activePair.name
      formData.append('partition1', partition1)
      formData.append('partition2', partition2)
      formData.append('mappingPartition', mappingPartition)
      formData.append('source1Id', source1Id)
      formData.append('pairId', this.$store.state.activePair.id)
      axios
        .post('/match/breakMatch', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
        )
        .then(() => {
          this.$store.state.dynamicProgress = false
          for (let k in this.$store.state.matchedContent) {
            if (this.$store.state.matchedContent[k].source1Id === source1Id) {
              this.$store.state.source1UnMatched.push({
                name: this.$store.state.matchedContent[k].source1Name,
                id: this.$store.state.matchedContent[k].source1Id,
                parents: this.$store.state.matchedContent[k].source1Parents
              })
              this.$store.state.source2UnMatched.push({
                name: this.$store.state.matchedContent[k].source2Name,
                id: this.$store.state.matchedContent[k].source2Id,
                source2IdHierarchy: this.$store.state.matchedContent[k].source2IdHierarchy,
                mappedParentName: this.$store.state.matchedContent[k].mappedParentName,
                parents: this.$store.state.matchedContent[k].source2Parents
              })
              this.$store.state.matchedContent.splice(k, 1)
              --this.$store.state.totalAllMapped
            }
          }
        })
        .catch(err => {
          if(!err.response) {
            console.error(err);
            this.breakMatch(source1Id)
          } else {
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = err.response.data.error
            this.selectedSource1Id = null
            this.selectedSource1Name = null
            this.dialog = false
            console.log(err)
          }
        })
    },
    unFlag (source1Id) {
      this.$store.state.progressTitle = 'Unflagging match'
      this.$store.state.dynamicProgress = true
      let formData = new FormData()
      let partition1 = this.$store.state.activePair.source1.name
      let partition2 = this.$store.state.activePair.source2.name
      let mappingPartition = this.$store.state.activePair.name
      formData.append('partition1', partition1)
      formData.append('partition2', partition2)
      formData.append('mappingPartition', mappingPartition)
      formData.append('source1Id', source1Id)
      formData.append('pairId', this.$store.state.activePair.id)
      
      axios
        .post('/match/breakMatch', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
        ).then(() => {
          this.$store.state.dynamicProgress = false
          for (let k in this.$store.state.flagged) {
            if (this.$store.state.flagged[k].source1Id === source1Id) {
              this.$store.state.source1UnMatched.push({
                name: this.$store.state.flagged[k].source1Name,
                id: this.$store.state.flagged[k].source1Id,
                parents: this.$store.state.flagged[k].source1Parents
              })
              this.$store.state.source2UnMatched.push({
                name: this.$store.state.flagged[k].source2Name,
                id: this.$store.state.flagged[k].source2Id,
                source2IdHierarchy: this.$store.state.flagged[k].source2IdHierarchy,
                mappedParentName: this.$store.state.flagged[k].mappedParentName,
                parents: this.$store.state.flagged[k].source2Parents
              })
              this.$store.state.flagged.splice(k, 1)
              --this.$store.state.totalAllFlagged
            }
          }
        })
        .catch(err => {
          if(!err.response) {
            console.error(err);
            this.unFlag(source1Id)
          } else {
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = err.response.data.error
            this.selectedSource1Id = null
            this.selectedSource1Name = null
            this.dialog = false
            console.log(err)
          }
        })
    },
    breakNoMatch (source1Id, type) {
      this.$store.state.progressTitle = 'Breaking no match'
      this.$store.state.dynamicProgress = true
      let formData = new FormData()
      let mappingPartition = this.$store.state.activePair.name
      formData.append('mappingPartition', mappingPartition)
      formData.append('source1Id', source1Id)
      formData.append('pairId', this.$store.state.activePair.id)
      axios
        .post('/match/breakNoMatch/' + type, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
        )
        .then(() => {
          this.$store.state.dynamicProgress = false
          if (type === 'nomatch') {
            for (let k in this.$store.state.noMatchContent) {
              if (this.$store.state.noMatchContent[k].source1Id === source1Id) {
                this.$store.state.source1UnMatched.push({
                  name: this.$store.state.noMatchContent[k].source1Name,
                  id: this.$store.state.noMatchContent[k].source1Id,
                  parents: this.$store.state.noMatchContent[k].parents
                })
                this.$store.state.noMatchContent.splice(k, 1)
                --this.$store.state.totalAllNoMatch
              }
            }
          } else if (type === 'ignore') {
            for (let k in this.$store.state.ignoreContent) {
              if (this.$store.state.ignoreContent[k].source1Id === source1Id) {
                this.$store.state.source1UnMatched.push({
                  name: this.$store.state.ignoreContent[k].source1Name,
                  id: this.$store.state.ignoreContent[k].source1Id,
                  parents: this.$store.state.ignoreContent[k].parents
                })
                this.$store.state.ignoreContent.splice(k, 1)
                --this.$store.state.totalAllIgnore
              }
            }
          }
        })
        .catch(err => {
          if(!err.response) {
            console.error(err);
            this.breakNoMatch(source1Id, type)
          } else {
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = err.response.data.error
            this.selectedSource1Id = null
            this.selectedSource1Name = null
            this.dialog = false
            console.log(err)
          }
        })
    },
    noMatch (type) {
      this.$store.state.progressTitle = 'Saving as no match'
      this.$store.state.dynamicProgress = true
      let partition1 = this.$store.state.activePair.source1.name
      let partition2 = this.$store.state.activePair.source2.name
      let mappingPartition = this.$store.state.activePair.name
      let formData = new FormData()
      formData.append('partition1', partition1)
      formData.append('partition2', partition2)
      formData.append('mappingPartition', mappingPartition)
      formData.append('source1Id', this.selectedSource1Id)
      formData.append('recoLevel', this.$store.state.recoLevel)
      formData.append('totalLevels', this.$store.state.totalSource1Levels)
      formData.append('pairId', this.$store.state.activePair.id)

      axios
        .post(`/match/noMatch/${type}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(() => {
          this.$store.state.dynamicProgress = false
          // remove from Source 1 Unmatched
          if (type === 'nomatch') {
            for (let k in this.$store.state.source1UnMatched) {
              if (
                this.$store.state.source1UnMatched[k].id ===
                this.selectedSource1Id
              ) {
                this.$store.state.noMatchContent.push({
                  source1Name: this.selectedSource1Name,
                  source1Id: this.selectedSource1Id,
                  parents: this.$store.state.source1UnMatched[k].parents
                })
                ++this.$store.state.totalAllNoMatch
                this.$store.state.source1UnMatched.splice(k, 1)
              }
            }
          } else if (type === 'ignore') {
            for (let k in this.$store.state.source1UnMatched) {
              if (
                this.$store.state.source1UnMatched[k].id ===
                this.selectedSource1Id
              ) {
                this.$store.state.ignoreContent.push({
                  source1Name: this.selectedSource1Name,
                  source1Id: this.selectedSource1Id,
                  parents: this.$store.state.source1UnMatched[k].parents
                })
                ++this.$store.state.totalAllIgnore
                this.$store.state.source1UnMatched.splice(k, 1)
              }
            }
          }
          this.dialog = false
          this.selectedSource1Id = null
          this.selectedSource1Name = null
        })
        .catch(err => {
          if(!err.response) {
            console.error(err);
            this.noMatch(type)
          } else {
            this.$store.state.dynamicProgress = false
            this.alert = true
            this.alertTitle = 'Error'
            this.alertText = err.response.data.error
            this.dialog = false
            this.selectedSource1Id = null
            this.selectedSource1Name = null
          }
        })
    },
    back () {
      this.searchPotential = ''
      this.dialog = false
    }
  },
  computed: {
    nextLevelText: {
      get: function () {
        return this.translateDataHeader('source1', this.$store.state.recoLevel)
      },
      set: function () { }
    },
    currentLevelText: {
      get: function () {
        return this.translateDataHeader(
          'source1',
          this.$store.state.recoLevel - 1
        )
      },
      set: function () { }
    },
    matchedHeaders () {
      let header = [
        { text: this.$t(`App.hardcoded-texts.Source1 Location`), value: 'source1Name' },
        { text: this.$t(`App.hardcoded-texts.Source1 ID`), value: 'source1Id' },
        { text: this.$t(`App.hardcoded-texts.Source2 Location`), value: 'source2Name' },
        { text: this.$t(`App.hardcoded-texts.Source2 ID`), value: 'source2Id' },
        { text: this.$t(`App.hardcoded-texts.Match Comment`), value: 'matchComments' }
      ]
      return header
    },
    source1GridHeaders () {
      let header = [{ text: this.$t(`App.hardcoded-texts.Location`), value: 'name' }]
      if (this.$store.state.source1UnMatched.length > 0) {
        for (
          let i = this.$store.state.source1UnMatched[0].parents.length;
          i > 0;
          i--
        ) {
          header.push({ text: 'Level ' + i, value: 'level' + (i + 1) })
        }
      }
      header.splice(1, 1)
      return header
    },
    potentialHeaders () {
      var results = []
      results.push(
        { sortable: false },
        { text: this.$t(`App.hardcoded-texts.Source 2 Location`), value: 'name', sortable: false },
        { text: this.$t(`App.hardcoded-texts.ID`), value: 'id', sortable: false },
        { text: this.$t(`App.hardcoded-texts.Parent`), value: 'source2Parent', sortable: false }
      )
      if (this.$store.state.recoLevel === this.$store.state.totalSource1Levels) {
        results.push({
          text: this.$t(`App.hardcoded-texts.Geo Dist (Miles)`),
          value: 'geodist',
          sortable: false
        })
      }
      results.push({ text: this.$t(`App.hardcoded-texts.Score`), value: 'score' })
      results.push({ text: this.$t(`App.hardcoded-texts.Comment`), value: 'comment', sortable: false,})
      return results
    },
    potentialAvailable () {
      return (
        this.$store.state.source2UnMatched !== null &&
        this.$store.state.source2UnMatched.length > this.potentialMatches.length
      )
    },
    allPotentialMatches () {
      if (
        this.$store.state.source2UnMatched !== null &&
        this.$store.state.source2UnMatched.length >
        this.potentialMatches.length &&
        this.showAllPotential
      ) {
        let results = []
        for (let addIt of this.$store.state.source2UnMatched) {
          let matched = this.potentialMatches.find(matched => {
            return matched.id === addIt.id
          })
          if (!matched) {
            addIt.score = 'N/A'
            // if (!addIt.source2IdHierarchy && addIt.source2IdHierarchy) {
            //   addIt.source2IdHierarchy = addIt.source2IdHierarchy
            // }
            results.push(addIt)
          }
        }
        return this.potentialMatches.concat(results)
      } else {
        return this.potentialMatches
      }
    },
    source1Tree () {
      this.addListener()
      const createTree = (current, results) => {
        for (let name in current) {
          let add = { text: name }
          add.children = []
          createTree(current[name], add.children)
          if (add.children.length === 0) {
            delete add.children
          }
          results.push(add)
        }
      }
      let results = []
      if (
        Object.keys(this.$store.state.source1Parents).length === 1 &&
        Object.keys(this.$store.state.source1Parents)[0] === 'null'
      ) {
        return results
      }
      createTree(this.$store.state.source1Parents, results)
      return results
    },
    source1Grid () {
      if (
        this.$store.state.source1UnMatched.length > 0 &&
        this.source1Filter.level !== ''
      ) {
        let parentIdx =
          this.$store.state.source1UnMatched[0].parents.length -
          this.source1Filter.level
        return this.$store.state.source1UnMatched.filter(
          location => location.parents[parentIdx] === this.source1Filter.text
        )
      }
      return this.$store.state.source1UnMatched
    },
    goNextLevel () {
      if (
        this.$store.state.recoLevel < this.$store.state.totalSource1Levels &&
        this.$store.state.source1UnMatched !== null &&
        this.$store.state.source1UnMatched.length === 0 &&
        this.$store.state.flagged !== null &&
        this.$store.state.flagged.length === 0 &&
        this.$store.state.matchedContent !== null &&
        this.$store.state.matchedContent.length !== 0
      ) {
        return 'yes'
      } else {
        return 'no'
      }
    },
    lastLevelDone () {
      if (
        this.$store.state.recoLevel === this.$store.state.totalSource1Levels &&
        this.$store.state.source1UnMatched !== null &&
        this.$store.state.source1UnMatched.length === 0 &&
        this.$store.state.flagged !== null &&
        this.$store.state.flagged.length === 0
      ) {
        return 'yes'
      } else {
        return 'no'
      }
    },
    source1TotalRecords () {
      if (this.$store.state.scoreResults) {
        return this.$store.state.scoreResults.length
      } else {
        return 0
      }
    },
    source1TotalMatched () {
      if (this.$store.state.matchedContent) {
        return this.$store.state.matchedContent.length
      } else {
        return 0
      }
    },
    source1PercentMatched () {
      if (this.source1TotalRecords === 0) {
        return 0
      } else {
        return parseFloat(
          ((this.source1TotalMatched * 100) / this.source1TotalRecords).toFixed(
            1
          )
        )
      }
    },
    source1TotalUnMatched () {
      return this.source1TotalRecords - this.source1TotalMatched
    },
    source1PercentUnMatched () {
      if (this.source1TotalRecords === 0) {
        return 0
      } else {
        return parseFloat(
          (
            (this.source1TotalUnMatched * 100) /
            this.source1TotalRecords
          ).toFixed(1)
        )
      }
    },
    totalFlagged () {
      if (this.$store.state.flagged) {
        return this.$store.state.flagged.length
      } else {
        return 0
      }
    },
    source1PercentFlagged () {
      if (this.$store.state.scoreResults.length === 0) {
        return 0
      } else if (this.$store.state.flagged) {
        return parseFloat(
          (
            (this.$store.state.flagged.length * 100) /
            this.$store.state.scoreResults.length
          ).toFixed(1)
        )
      } else {
        return 0
      }
    },
    source1TotalNoMatch () {
      if (this.$store.state.noMatchContent) {
        return this.$store.state.noMatchContent.length
      } else {
        return 0
      }
    },
    source1TotalIgnore () {
      if (this.$store.state.ignoreContent) {
        return this.$store.state.ignoreContent.length
      } else {
        return 0
      }
    },
    source1PercentNoMatch () {
      if (this.$store.state.scoreResults.length === 0) {
        return 0
      } else if (this.$store.state.noMatchContent) {
        return parseFloat(
          (
            (this.$store.state.noMatchContent.length * 100) /
            this.$store.state.scoreResults.length
          ).toFixed(1)
        )
      } else {
        return 0
      }
    },
    source1PercentIgnore () {
      if (this.$store.state.scoreResults.length === 0) {
        return 0
      } else if (this.$store.state.ignoreContent) {
        return parseFloat(
          (
            (this.$store.state.ignoreContent.length * 100) /
            this.$store.state.scoreResults.length
          ).toFixed(1)
        )
      } else {
        return 0
      }
    },
    source2TotalRecords () {
      if (this.$store.state.source2TotalRecords) {
        return this.$store.state.source2TotalRecords
      } else {
        return 0
      }
    },
    source2TotalUnmatched () {
      if (this.source2TotalRecords > 0 && this.$store.state.matchedContent) {
        return (
          parseInt(this.source2TotalRecords) -
          parseInt(this.$store.state.matchedContent.length)
        )
      } else {
        return 0
      }
    },
    source2PercentUnmatched () {
      if (this.$store.state.source2TotalRecords === 0) {
        return 0
      } else {
        return parseFloat(
          (
            (this.source2TotalUnmatched * 100) /
            this.$store.state.source2TotalRecords
          ).toFixed(1)
        )
      }
    },
    source2PercentFlagged () {
      if (this.$store.state.source2TotalRecords === 0) {
        return 0
      } else if (this.$store.state.flagged) {
        return parseFloat(
          (
            (this.$store.state.flagged.length * 100) /
            this.$store.state.source2TotalRecords
          ).toFixed(1)
        )
      } else {
        return 0
      }
    },
    source2TotalMatched () {
      return this.source1TotalMatched
    },
    source2PercentMatched () {
      if (this.$store.state.source2TotalRecords === 0) {
        return 0
      } else {
        return parseFloat(
          (
            (this.source2TotalMatched * 100) /
            this.$store.state.source2TotalRecords
          ).toFixed(1)
        )
      }
    },
    source2NotInSource1 () {
      var missing = this.source2TotalRecords - this.source1TotalRecords
      if (missing < 0) {
        return 0
      } else {
        return missing
      }
    },
    source2PercentNotInSource1 () {
      if (this.source2NotInSource1 === 0) {
        return 0
      }
      var percent = parseFloat(
        ((this.source2NotInSource1 * 100) / this.source2TotalRecords).toFixed(1)
      )
      return parseFloat(percent)
    }
  },
  created () {
    if (this.$store.state.recalculateScores) {
      this.$store.state.recalculateScores = false
      this.getScores(false)
    }
    eventBus.$on('changeCSVHeaderNames', () => {
      let levelName = this.translateDataHeader(
        'source1',
        this.$store.state.recoLevel
      )
      this.nextLevelText = levelName
      this.currentLevelText = levelName
    })
    this.addListener()
    if (this.$store.state.recoLevel === this.$store.state.totalSource1Levels) {
      this.dialogWidth = 'auto'
    } else {
      this.dialogWidth = '1500px'
    }
    // This is needed because the tree doesn't show up on the initial page load without it
    this.source1TreeUpdate++
  },
  components: {
    'liquor-tree': LiquorTree,
    'appRecoExport': ReconciliationExport
  }
}
</script>
<style>
</style>
