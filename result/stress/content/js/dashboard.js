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

    var data = {"OkPercent": 99.66666666666667, "KoPercent": 0.3333333333333333};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9327083333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6791666666666667, 500, 1500, "Add User"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "Get Contacts"], "isController": false}, {"data": [0.98, 500, 1500, "Get User Profile"], "isController": false}, {"data": [0.9675, 500, 1500, "Add Contact"], "isController": false}, {"data": [0.9633333333333334, 500, 1500, "Patch Contact"], "isController": false}, {"data": [0.9733333333333334, 500, 1500, "Update Contact"], "isController": false}, {"data": [0.965, 500, 1500, "Update User"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "Delete Contact"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4800, 16, 0.3333333333333333, 408.40583333333296, 1, 31213, 281.0, 513.0, 1084.8999999999996, 1594.9799999999996, 7.957045217567167, 7.639860999330281, 4.805939076904013], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add User", 600, 2, 0.3333333333333333, 834.3399999999997, 1, 4948, 1025.0, 1518.2999999999997, 1681.85, 2005.99, 0.997801510671487, 1.2470537571800133, 0.4069792655806706], "isController": false}, {"data": ["Get Contacts", 600, 2, 0.3333333333333333, 310.9649999999999, 248, 823, 266.0, 431.0, 510.0, 595.0, 1.0015557499315604, 0.9854271812632289, 0.512469212593562], "isController": false}, {"data": ["Get User Profile", 600, 2, 0.3333333333333333, 312.68833333333305, 245, 1248, 264.0, 428.9, 472.0, 646.9100000000001, 1.0006754559327546, 0.8548055093438071, 0.5120187897664257], "isController": false}, {"data": ["Add Contact", 600, 2, 0.3333333333333333, 317.1883333333335, 253, 1163, 272.0, 430.69999999999993, 512.0, 696.6700000000003, 1.000974281634124, 0.9877061589947548, 0.7931091992038917], "isController": false}, {"data": ["Patch Contact", 600, 2, 0.3333333333333333, 327.6166666666667, 1, 1299, 277.0, 452.79999999999995, 514.9499999999999, 789.7600000000011, 1.0018149547597064, 0.9901042858061188, 0.586994427821737], "isController": false}, {"data": ["Update Contact", 600, 2, 0.3333333333333333, 418.01666666666665, 254, 30280, 273.0, 419.0, 509.29999999999905, 647.9000000000001, 1.0017614305153226, 1.017009596039703, 0.8192856293148786], "isController": false}, {"data": ["Update User", 600, 2, 0.3333333333333333, 321.6266666666665, 251, 1120, 274.0, 450.0, 511.0, 664.7500000000002, 1.0007054973756497, 0.8626100932407347, 0.6172157360522502], "isController": false}, {"data": ["Delete Contact", 600, 2, 0.3333333333333333, 424.8050000000001, 251, 31213, 274.0, 446.0, 510.0, 743.2300000000007, 1.0023521864642362, 0.7426411687760611, 0.5891494644933444], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1, 6.25, 0.020833333333333332], "isController": false}, {"data": ["503/Service Unavailable", 4, 25.0, 0.08333333333333333], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 3, 18.75, 0.0625], "isController": false}, {"data": ["401/Unauthorized", 8, 50.0, 0.16666666666666666], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4800, 16, "401/Unauthorized", 8, "503/Service Unavailable", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 3, "400/Bad Request", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add User", 600, 2, "400/Bad Request", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Contacts", 600, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get User Profile", 600, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Contact", 600, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Patch Contact", 600, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Contact", 600, 2, "503/Service Unavailable", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update User", 600, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Contact", 600, 2, "503/Service Unavailable", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
