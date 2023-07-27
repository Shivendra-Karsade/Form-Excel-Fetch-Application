function onFormSubmit(e) {
  //var sheet = SpreadsheetApp.getActiveSheet();
  //formData = e.values;
  //sheet.appendRow(formData);
  uploadCSVToSheet();
}

function uploadCSVToSheet() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  Logger.log[lastRow[0]];
  var dataRange = sheet.getRange(2, 3, lastRow - 1, 3);
  Logger.log(lastRow);
  var data = dataRange.getValues();
  var targetSheet = SpreadsheetApp.getActive().getSheetByName("DB");
  var lastdestrow = targetSheet.getLastRow();
  //Logger.log(data.length);
  for (var i = data.length-1; i >0; i--) {
    var row = data[i];
    var link = row[0];
    Logger.log(row);
    Logger.log(link);
    Logger.log(fileId);
    if (link) {
    var fileId = link.match(/id=([^&]+)/);
    //Logger.log(fileId);
    if (!fileId) { 
    Logger.log("The link does not match the expected format: " + link);
    continue;
    }
    fileId = fileId[1];
    } else {
    Logger.log("The link is undefined");
    continue;
    }
     
    var options = {
    muteHttpExceptions: true,
    timeout: 10000
    };

    var response = UrlFetchApp.fetch("https://docs.google.com/spreadsheets/d/" + fileId + "/export?format=csv",options);
    var csvData = response.getContentText();
    var fileBlob = Utilities.newBlob(csvData, 'text/csv', 'csv.csv');
    var tempFile = DriveApp.createFile(fileBlob);
    Logger.log(tempFile);
  
    let files = DriveApp.getFilesByName(tempFile);
    let csvFile = null;
    if(files.hasNext())
    csvFile = files.next();
    else
    return null;
    let blob = csvFile.getBlob();
    let config = {
    title: "[Google Sheets] " + csvFile.getName(),
    parents: [{id: csvFile.getParents().next().getId()}],
    mimeType: MimeType.GOOGLE_SHEETS
    };
    let spreadsheet = Drive.Files.insert(config, blob);
    let spreadsheetId = spreadsheet.id;
    Logger.log(spreadsheetId);
    // var tempFile = DriveApp.getFilesByName("tempFile"); 
    var tempSheet = SpreadsheetApp.openById(spreadsheetId).getSheets()[0];
    //Logger.log(tempFile);
    var lasttemprow = tempSheet.getLastRow();
    var lasttempcolumn = tempSheet.getLastColumn();
    var tempRange = tempSheet.getRange(2, 1, lasttemprow, lasttempcolumn);
    
    //for (var i in tempRange) {
    //while(tempRange[i][1] !== null && tempRange[i][1] !== '')
    //{
    var tempData = tempRange.getValues();
    //}
    //}
    Logger.log(tempRange.getNumRows());
    targetSheet.getRange(lastdestrow+1, 1, tempRange.getNumRows(), tempRange.getNumColumns()).setValues(tempData);
    DriveApp.getFileById(tempFile.getId()).setTrashed(true); 
    break;
  }
}
