Ext.define('Rally.technicalservices.StorySummary',{

    issues:[{
        type: 'noFeature',
        displayName: 'Stories Missing Features',
        pointsFn: function(record){
            if (!record.get('Feature')){
                return record.get('PlanEstimate') || 0;
            }
            return 0;
        },
        countFn: function(record){
            if (!record.get('Feature')){
                return 1;
            }
            return 0;
        }
    },{
        type: 'noPlanEstimate',
        displayName: 'Unestimated Stories',
        countFn: function(record){
            if (record.get('PlanEstimate') === 0 || record.get('PlanEstimate') > 0){
                return 0;
            }
            return 1;
        }
    },{
        type: 'blockedStories',
        displayName: 'Blocked Stories',
        countFn: function(record){
            if (record.get('Blocked') && record.get('Blocked') === true){
                return 1;
            }
            return 0;
        },
        pointsFn: function(record){
            if (record.get('Blocked') && record.get('Blocked') === true){
                return record.get('PlanEstimate') || 0;
            }
            return 0;
        }
    },{
        type: 'splitStories',
        displayName: 'Carry Over Stories',
        countFn: function(record){
            var regex = new RegExp("^\\[Continued\\]", "i");
            //console.log('carryover', regex.test(record.get('Name')), record.get('Name'));
            if (regex.test(record.get('Name'))){
                return 1;
            }
            return 0;
        },
        pointsFn: function(record){
            var regex = new RegExp("^\\[Continued\\]", "i");
            if (regex.test(record.get('Name'))){
                return record.get('PlanEstimate') || 0;
            }
            return 0;
        }
    },{
        type: 'missingRelease',
        displayName: 'Missing Release',
        countFn: function(record){
            if (!record.get('Release')){
                return 1;
            }
            return 0;
        },
        pointsFn: function(record){
            if (!record.get('Release')){
                return record.get('PlanEstimate') || 0;
            }
            return 0;
        }
    },{
        type: 'missingOwner',
        displayName: 'Missing Owner',
        countFn: function(record){
            if (!record.get('Owner') || !record.get('Owner')._refObjectName || record.get('Owner')._refObjectName.length === 0){
                return 1;
            }
            return 0;
        },
        pointsFn: function(record){
            if (!record.get('Owner') || !record.get('Owner')._refObjectName || record.get('Owner')._refObjectName.length === 0){
                return record.get('PlanEstimate') || 0;
            }
            return 0;
        }
    }],

    getStateColumnCfgs: function(){
        return [{
            dataIndex: 'state',
            text: 'State',
            flex: 1
        },{
            dataIndex: 'count',
            text: 'Story Count'
        },{
            dataIndex: 'points',
            text: 'Total Points'
        }];
    },
    getIssueColumnCfgs: function(){
        return [{
            dataIndex: 'issueName',
            text: 'Potential Issue List',
            flex: 1
        },{
            dataIndex: 'count',
            text: 'Count'
        },{
            dataIndex: 'points',
            text: 'Points'
        }];
    },
    _initializeSummary: function(types){
        var summary = {};
        _.each(types, function(t){
            summary[t] = {
                points: 0,
                count: 0
            };
        });
        return summary;
    },

    getStateSummaryData: function(states, records){
       var stateSummary = this._initializeSummary(states),
           totalCount = 0,
           totalPoints = 0,
           acceptedCount = 0,
           acceptedPoints = 0,
           acceptedStates = ['Accepted'];

        _.each(records, function(r){
            var ss = r.get('ScheduleState'),
                planEstimate = r.get('PlanEstimate') || 0 ;

            if (stateSummary[ss]){
                stateSummary[ss].count++;
                stateSummary[ss].points = stateSummary[ss].points + planEstimate;
            }
            totalCount++;
            totalPoints += planEstimate;

            if (Ext.Array.contains(acceptedStates, ss)){
                acceptedCount++;
                acceptedPoints += planEstimate;
            }
        });

        var data = _.map(states, function(s){
            return {state: s, count: stateSummary[s].count || 0, points: stateSummary[s].points || 0};
        });
        data.push({state: 'Total',
            count: totalCount,
            points: totalPoints
        });

        var acceptedCountPct = acceptedCount/totalCount * 100,
            acceptedPointsPct = acceptedPoints/totalPoints * 100;

        data.push({state: '% Accepted',
            count: !isNaN(acceptedCountPct) ? acceptedCountPct.toFixed(1) + " %" : "NaN",
            points:!isNaN(acceptedPointsPct) ? acceptedPointsPct.toFixed(1) + " %" : "NaN"
        });

        return data;
    },
    getIssuesSummaryData: function(records){
        var data = [];

        _.each(this.issues, function(issue){
            var row = {type: issue.type, issueName: issue.displayName, count: 0, points: 0};
            _.each(records, function(r){
                if (issue.countFn){
                    row.count += issue.countFn(r);
                }
                if (issue.pointsFn){
                    row.points += issue.pointsFn(r);
                } else {
                    row.points = '--';
                }
            });
            data.push(row);
        });
        return data;
    }
});