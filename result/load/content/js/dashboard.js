/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.0, "KoPercent": 2.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.78875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.595, 500, 1500, "Add User"], "isController": false}, {"data": [0.79, 500, 1500, "Get Contacts"], "isController": false}, {"data": [0.85, 500, 1500, "Get User Profile"], "isController": false}, {"data": [0.85, 500, 1500, "Add Contact"], "isController": false}, {"data": [0.745, 500, 1500, "Patch Contact"], "isController": false}, {"data": [0.845, 500, 1500, "Update Contact"], "isController": false}, {"data": [0.81, 500, 1500, "Update User"], "isController": false}, {"data": [0.825, 500, 1500, "Delete Contact"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 16, 2.0, 648.0062500000009, 1, 32054, 328.0, 974.9, 1073.9499999999998, 1503.850000000001, 10.870155986738409, 10.440591094454861, 6.5356282100929395], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add User", 100, 2, 2.0, 859.9099999999996, 283, 1752, 1007.5, 1338.4, 1389.75, 1750.029999999999, 6.3075564526302506, 7.81385513908162, 2.5778441166267188], "isController": false}, {"data": ["Get Contacts", 100, 2, 2.0, 450.62, 249, 997, 336.0, 725.6, 751.6499999999999, 996.7799999999999, 6.767273465520741, 6.627962796914123, 3.4498555610069706], "isController": false}, {"data": ["Get User Profile", 100, 2, 2.0, 417.15000000000003, 245, 1133, 283.5, 814.1000000000003, 957.0, 1131.4399999999991, 6.82547266398198, 5.8140495955907445, 3.479524648488158], "isController": false}, {"data": ["Add Contact", 100, 2, 2.0, 417.07000000000005, 251, 975, 300.0, 753.6, 766.95, 974.8699999999999, 6.7677314564158095, 6.650750160733622, 5.3495480424336765], "isController": false}, {"data": ["Patch Contact", 100, 2, 2.0, 513.5100000000001, 1, 1005, 402.0, 779.9, 990.0, 1004.98, 2.559967232419425, 2.5754170346619563, 1.4748811215216444], "isController": false}, {"data": ["Update Contact", 100, 2, 2.0, 1015.77, 260, 30930, 302.5, 743.8, 817.3499999999995, 30923.809999999998, 2.5432349949135302, 2.587617425928281, 2.0741770250508647], "isController": false}, {"data": ["Update User", 100, 2, 2.0, 425.24, 249, 767, 298.0, 731.4000000000001, 749.6999999999999, 766.99, 6.771397616468039, 5.823401950162514, 4.158061348862405], "isController": false}, {"data": ["Delete Contact", 100, 2, 2.0, 1084.78, 258, 32054, 319.0, 973.2, 990.95, 32050.809999999998, 1.4180575447751669, 1.0601641933379655, 0.8302560746040074], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 12.5, 0.25], "isController": false}, {"data": ["503/Service Unavailable", 4, 25.0, 0.5], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 2, 12.5, 0.25], "isController": false}, {"data": ["401/Unauthorized", 8, 50.0, 1.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 16, "401/Unauthorized", 8, "503/Service Unavailable", 4, "400/Bad Request", 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add User", 100, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Contacts", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get User Profile", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Contact", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Patch Contact", 100, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Contact", 100, 2, "503/Service Unavailable", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update User", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Contact", 100, 2, "503/Service Unavailable", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
