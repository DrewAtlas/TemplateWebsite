/* Atlas-CommonCode()
    Purpose:        Contains functions that are useful for several projects
    Author:         Drew Topel
  Copyright (c) 2009-2017 Atlas Software Services - Licensed to clients for use in their project
  All Rights Reserved - Used by Permission
	Ownership and licensed use: The software contained in this file was wholly Created by AtlasSoftwareServices independently 
 				from client projects. As such AtlasSoftwareServices retains ownership and can elect to use this class library 
 				within any client's project when needed. 
 				There is NO implied transfer or sharing of ownership of the content of this file when used within a client project
*/


console.info("Processing Atlas-CommonCode.js");

var EnterKeyValue = 13;		// ASCII for the Enter key

/* CreateOneTimeEventHandler()
	Purpose:	Provide a general mechanism to clear out a field and potentially call specific code when
					the named event is detected for the named DOM element (e.g. a field). Also make it so that
					this logic can only be executed once.
	Inputs:		onWhichEvent	the name of the event on which we should execute. This can be a list of events, in which cas you would
									pass in a space-separated list of events e.g. "keydown focus"
				fieldName		the DOM element selectoron which we should install the handler. The selector can be of arbitrary complexity following jQuery selector rules
									with the most common being a simple comma-separated list which means to select each one individually
								Note: If a list of selectors is passed, the first event that occurs will execute the logic and no others will
								so it truly is a one-time-event for one or more events, whichever is passed in
				fieldDefault	the default value that this field has if you want to check against it. That is, only clear out the field
								if the current value matches the default. If you pass null or empty string then this logic is skipped
				callback		a function callback of more logic to execute when the event occurs. If null (or not passed) this is ignored
								The signature of the callback is 
									myCallback( onWhichEvent, fieldName ) - i.e. we pass through the event and field for which this callback is being used
	Outputs:	the named field will be cleared when the event occurs, possible callback to your logic is also made
*/
var statusVars = [];
function CreateOneTimeEventHandler(onWhichEvent, fieldName, fieldDefault, callback)
{
	// Create callback function which will clear a field the first time the user either clicks, or hits a key in the field
	$(fieldName).on(onWhichEvent, function (evt)
	{
		// Just one trip in here is allowed, get out if we have been here
		// If we don't have a key for this field, then we haven't been here, continue. Otherwise return
		if (statusVars[fieldName])
			return;

		// Clear out the field if it still contains the default
		if (Strings.hasValue(fieldDefault)) {
			if ($(fieldName).val() == fieldDefault)
				$(fieldName).val('');
		}
		else
			$(fieldName).val('');

		if (callback)
			callback(onWhichEvent, fieldName);

		// Create key which will tell use we have completed this step
		statusVars[fieldName] = true;
	});
}

//-------------------------------------------------------------------  KEY PRESS FILTERING FUNCS

/* OnlyAllowNumericInputHere()
 * Purpose:	Make it so that only numbers can be input into the given field. Numbers also include certain numeric-related
 *				punctuation like - and common keys like backspace and delete
 * Inputs:		the jQuery selector of the element that we wish to monitor. Note that you should be using an id for this
 *					and not a class
 * Algo:		Check characters as they are typed into the time-entry field
 * Use:			Call this function from within the area in your program where you are setting up event handlers. 
 *				Nothing happens as a result of calling this, but when keys are type into the indicated element, it will only allow numbers
 */
function OnlyAllowNumericInputHere(elementWhereTextisTyped)
{
	$(elementWhereTextisTyped).keydown(function (e)
	{
		// Upfront we know we will Allow: backspace, delete, tab, escape, enter, ., :
		//	so if we detect them just return which will let the character be input
		if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190, 186]) !== -1 ||
			// Allow: Ctrl/cmd+A
			(e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
			// Allow: Ctrl/cmd+C
			(e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
			// Allow: Ctrl/cmd+X
			(e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)) {
			// let it happen, don't do anything
			return;
		}
		// If the keydown is not a digit, prevent the keypress from being input (i.e. preventDefault discards the press)
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});
}

/* FormatNumberWithCommas()
 * Purpose:	take a larger number that might contain a decimal point and format it so that the groupsof 3 digits 
 *				are set apart by a comma. No currency sign is being assigned, so you'll have to add that yourself
 *				if you're using the number for that purpose
 * Inputs:	the number to format, it can be long or a Decimal
 *-----------------------------------------------------------
 * Returns:	the comma formatted number
 */
function FormatNumberWithCommas(x, addCents)
{
	var num = ConvertToNumber(x);
	var commaNum = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	// Add in the cents if the user wants it
	if (addCents && isInt(x)) {
		commaNum += ".00";
	}
	return commaNum;
}

// Take a string that probably has a $ and comma separators in it and convert it to a Number 
function CurrencyToFloat(cur)
{
	// Lose the dollar sign first
	cur = cur.replace(/$/g, '');
	// Get rid of any commas and parse what is left into a float
	return parseFloat(cur.replace(/,/g, ''));
}

// Another name for the currency conversion function - it'll take any Number object, but I just called it Float
function ConvertToCurrency(f)
{
	return CurrencyFormatFloat(f);
}
function FloatToCurrency(f)
{
	return CurrencyFormatFloat(f);
}
// Nicely format the passed floating point value into a currency value complete with prefixed $ and commas ever thousandth
function CurrencyFormatFloat(n)
{
	var aNum = ConvertToNumber(n);
	return ("$" + FormatNumberWithCommas(aNum.toFixed(2), true));
}

// Determine if the passed number is an Int, i.e. is there anything after the decimal point?
function isInt(n)
{	// First, we have to be sure we are dealing with a Number type - so convert if necessary
	var numVal = ConvertToNumber(n);
	if (numVal % 1 === 0)
		return true;
	return false;
}

// Just like the above, but we want to be sure there is a value after the decimal point
function isFloat(n)
{
	var numVal = ConvertToNumber(n);
	return ((numVal % 1) !== 0);
}

// Check to see if the passed variable is classified as a number already (i.e. before any automatic conversions that js does)
function isNumber(n)
{
	return (Number(n) === n);
}

// By performing a math operation on the passed input it forces it to be a Number type (and I do a -1 because +1 is also a string append)
// This function will even turn an arbitrary string into a 0.  parseFloat() is usually used but does it will fail on an arbitrary string.
function ConvertToNumber(num)
{
	var aNum = num - 1;
	return (aNum + 1);
}

/* Strings object
	Purpose:	Strings is an object that is beingh used as a holder for all of the general string functions
				that are in this file. This is done so that intellisense will show us all the functions that are 
				part of the commonCode implementation when you just type in Strings.
*/
var Strings = {};

/* GetStringValue()
 * Strings.getStringValue()
	Purpose:	Guarantee that you will be getting a string returned to you. It might be empty, but it is a string and not a bad
					undefined or null value
	Input:		the object to check 
	Returns:	the string object - if there are characters, or an empty string if not (in either case, you get a string!)
*/
function GetStringValue(theMbr)
{
	return (CheckStringHasValue(theMbr)) ? theMbr : "";
}
// Return either the passed string, if it valid and has characters, or an empty string
Strings.getStringValue = function (theStr) { return GetStringValue(theStr); }

/* CheckStringHasValue()
 * checkObject()
 *	Purpose:	Utility functions to make sure an object is OK to use before accessing it. If you know the object
 *				is a string then use the checkString() function that additionaly checks that the string's length > 0
 * Input:		the string to check
 * Returns:		true if the object is a string and has characters, otherwise false
 */
function CheckStringHasValue(theStr)
{
	return (checkObject(theStr) && theStr.length > 0);
}
// Return true if the passed object is a string and there are characters in it
Strings.hasValue = function (theStr) { return CheckStringHasValue(theStr); }

// My straightforward implementation to check whether an object is valid and good to use
/*	but this implementation has more steps than needed, see next one
function checkObject(theObj)
{
	return (theObj != null && theObj != undefined && theObj != NaN);
}
*/
// Faster (?) implementation for checkObject()
function checkObject(theObj)
{	// This works because 'theObj' evaluates as true if it is a valid object
	return (theObj) ? true : false;
};

/* AddComma() - or more aptly named "Maybe Give me a comma" because it doesn't return the string with the comma added, only the comma
	Purpose:	Utility snippet that will return a comma only if the passed string already has characters and the last char is not a comma
*/
function AddComma(str)
{
	return AddDelimiter(str, ',');
}
// Add a comma to the passed string, but only if there are already characters in it
Strings.addComma = function (theStr) { return AddComma(theStr); }

// More general version of AddComma() lets us add any delimiter we want including multi-char delimiters (e.g. ", ")
function AddDelimiter(str, del)
{	// First make sure we have a string to work with
	str = Strings.getStringValue(str);
	if (str.length > 0) {
		// We have to use substr to get the last part of the string since the delimiter can be more than one char
		var cmpStr = str.substr(str.length - del.length, del.length);
		// If the end of the current string does not have the delimiter, return the delimiter so the caller can add it onto their string
		if (cmpStr != del)
			return del;
	}
	// If string has zero length, or if it already ends in the delimiter, we'll return nothing so they won't add it to their string
	return "";
}
// Add the passed delimiter to the passed string, but only if there are already characters in it
Strings.addDelimiter = function (theStr, del) { return AddDelimiter(theStr, del); }

// If the passed string ends with clipChars, then Return the string minus those chars, otherwise return it whole
function ClipChars(str, clipChars)
{
	str = Strings.getStringValue(str);
	if (str.length >= clipChars.length) {
		// Grab the last part of the string, the same number of chars in the clipChars
		var cmpStr = str.substr(str.length - clipChars.length, clipChars.length);
		// If the end of the current string has the delimiter (or generally the clipChar), then clip it off
		if (cmpStr == clipChars)
			return str.substr(0, str.length - clipChars.length);
	}
	// If string had not enough chars to contain clipChars, or if it did not end with the clipChars, return original string
	return str;
}

// Put this useful string function into the Strings collection
Strings.clipChars = function (theStr, clipChars) { return ClipChars(theStr, clipChars); }

/* ConcatStrings( char delimiter, string str1, string str2, ... )
	Purpose:	Join together the passed strings using the indicated delimiter while avoiding any passed value that is undefined or NaN
	Inputs:		the delimiter to use when putting the strings together, e.g. ','
				the strings that you want put together. There can be any number of them, so that's why this function has no formal
					parameter list. In C# this function would look like this
				public string ConcatStrings( string delimiter, params object[] args)
*/
function ConcatStrings()
{
	if (arguments.length < 3) {	// This is a legal use of the function if sometimes the user has strings to concat and other times doesn't
		//console.log("Must have at least the delimiter and 2 strings as arguments to add together to use ConcatStrings()");
		return (arguments.length > 1) ? arguments[1] : "";
	}
	var retVal = "";
	var delimiter = "";
	if (arguments.length > 0)
		delimiter = GetStringValue(arguments[0]);
	for (var i = 1; i < arguments.length; i++) {
		// Go through each of the passed parameters and attempt to add it to the result string
		retVal += GetStringValue(arguments[i]);
		retVal += AddDelimiter(retVal, delimiter);
	}
	// Clip off the extra delimiter if necessary
	retVal = ClipChars(retVal, delimiter);

	return retVal;
}
// Concatenate the passed strings together, separating them by a delimiter that is passed as the first parameter
Strings.concatStrings = function () { return ConcatStrings(); }

/* StartsWith()
 * Purpose:	Provide the utility function that should be in JS and Is, but not on every browser
 * Inputs:	The string to search
 *			the string that you want to see starting that string
 * Returns:	true if startStr starts the searchStr exactly
 */
function StartsWith(searchStr, startStr)
{
	searchStr = GetStringValue(searchStr);
	startStr = GetStringValue(startStr);
	return (searchStr.substring(0, startStr.length) === startStr);
}
// Returns true if the the passed searchStr contains and starts with the passed startStr
Strings.startsWith = function (searchStr, startStr) { return StartsWith(searchStr, startStr); }


// Check if the passed string has a valid time - i.e. up to 2 digits a : separator (or dash), and 2 digits
function IsTimeValid(time2Chk)
{
	time2Chk = GetStringValue(time2Chk);
	var d = new Date();
	var time = time2Chk.match(/(\d+)(?::(\d\d))?\s*(p?)/);
	d.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
	d.setMinutes(parseInt(time[2]) || 0);
	console.log(d);
	return d;
}

// Utility function that counts the lines in the passed data
function CountLines(dataObj)
{
	var myLines = dataObj.split(/\n/);
	return myLines.length;
}

/*SaveFileAs_NoGood()	 this doesn't work so I'm renaming it
 * Purpose:		Function to save a text file using a file save dialog
 * Inputs:		the name of the file that will be used initially in the dialog
 *				the content of the file you're going to save
 * Use:				SaveFileAs('test.txt', 'Hello world!');
 * Returns:		nothing
 */
/*
function SaveFileAs_NoGood(filename, text)
{
	var pom = document.createElement('a');
	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	pom.setAttribute('download', filename);

	if (document.createEvent) {
		var event = document.createEvent('MouseEvents');
		event.initEvent('click', true, true);
		pom.dispatchEvent(event);
	}
	else {
		pom.click();
	}
}
*/

/* SaveFile()
  * Purpose:	Function to save a text file using a file save dialog
 
 * SaveFileAs()
 * Purpose:		Function to save an arbitrary-typed file using a file save dialog
 * Inputs:		the name of the file that will be used initially in the dialog
 *				the type (extension) that the file should be using
 *				the content of the file you're going to save
 * Use:		SaveFileAs('test.txt', ".txt", 'Hello world!');
 * Returns:		nothing
 */
function SaveFile(filename, filecontent)
{
	filename = CreateUniqueFilename(filename);
	SaveFileAs(filename, "text/plain;charset=" + document.characterSet, filecontent);
}
function SaveFileAs(filename, ftype, data)
{
	var file = new Blob([data], { type: ftype });
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"),
                url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function ()
		{
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

/* Example of how to insert an actual File Save Dialog on your #button click
$('#button').on('click', function ()
{
	// Bring up the file dialog - doesn't work on a bunch of browsers tho
	$('#file-input').trigger('click');
});
*/


// Check if a file exists by pretending it is a resource we want to get
function FileExists(filename)
{
	$.get(filename)
    .done(function ()
    {
    	return true;
    }).fail(function ()
    {
    	return false;
    });
}

function CreateUniqueFilename(filename)
{
	var number = 0;
	while (FileExists(filename)) {
		filename = filename + number++;
	}
	return filename;
}

// Deprecate this function as it does nothing useful
function FormatDate(pattern, theDate)
{
	return GetShortDateString(theDate);
}

function GetShortFileCompatibleDateString(theDate)
{
	return GetShortDateString(theDate, '-');
}
// Given a Javascript date object, return a string like MM/DD/YY
function GetShortDateString(theDate)
{
	return GetShortDateString(theDate, '/');
}
function GetShortDateString(theDate, separator)
{
	// See if there is a value for separator, if there is then it will evaluate as true
	if (!separator)
		separator = "-";
	var aDate = new Date(theDate);
	var dateStr = pad(aDate.getMonth() + 1) + separator + pad(aDate.getDate()) + separator + aDate.getFullYear();
	return dateStr;
}
// Add leading zero to numbers less than 10
function pad(n)
{
	return (n < 10) ? ("0" + n) : n;
}
function ZeroPadSmallNumbers(n)
{
	return pad(n);
}

/* CreateTableFromCSV()
 * Purpose:	Given data in CSV format, create a HTML table. If there is header present pass true for the 2nd parameter
 * Inputs:	the CSV data (i.e. comma-separated column values, newline in between rows)
 *			a boolean flag indicating whether the first row of data should be considered to be a header or not
 *			the css id to put into the table so it can be identified and/or styled
 *				Note: We will insert a header ID that will be the word 'header' followed by the tableId in case that is needed by the caller
 * Returns:	the HTML of the requested table
 */
function CreateTableFromCSV(csvData, headerPresent, tblId)
{
	var csvArrays = CsvToArray(csvData);
	var tableObj = [];		// Create the object we are going to send along
	if (headerPresent) {
		tableObj.tableHeader = csvArrays.shift();
	}
	tableObj.tableData = csvArrays;
	// Turn the CSV into an array of arrays and then feed it into our table maker that knows how to deal with that
	return CreateTable(tableObj, tblId);
}

/* CsvToArray()
	Purpose:	 Turn a CSV into an array of lines, each of those lines will contain an array of elements that were obtained by splitting
				the initial line by the comma character. 
	Note:		the splitting of the fields in a line by the comma character does not take into account that a comma might be within
					a string in the CSV data (which is a legal situation), so it will do an additional split in that case which
					is not what would want. So the message here is - make sure your CSV strings do not contain commas or use a different
					function to get the array
*/
function CsvToArray(csvString)
{
	// The array we're going to build
	var csvArray = [];
	// Break it into rows to start
	var csvRows = csvString.split(/\n/);

	// Loop through rows, split the members and assign the row array to the top level array
	for (var rowIndex = 0; rowIndex < csvRows.length; ++rowIndex) {
		var rowArray = csvRows[rowIndex].split(',');
		csvArray[rowIndex] = rowArray;
	}
	return csvArray;
}

/* CreateTable()
 * Purpose:	Create an HTML table given an javascript object that has up to two properties:
 *				tableHeader: An array of table header string fields
 *				tableData:	An array of arrays. Each member of the top level array is assumed to  be a row
 *							and the contents of the row are the members of the inner array.
 * Inputs:	the table definition as described above - an array of arrays
 *			a boolean indicating whether the first row-containing data array is to be considered header data (true) or not,
 *			the css id to put into the table so it can be identified and/or styled
 *				Note: We will insert a header ID that will be the word 'header' followed by the tableId in case that is needed by the caller
 * Returns:	the HTML of the requested table
 */
function CreateTable(tableDef, tblId)
{
	var tableStart = '<tbody id="' + tblId + '">';
	var tableEnd = "</tbody>";
	var tableRows = "";
	var tHdr = "";
	var startRow = 0;
	var col = 0;

	if (!(tableDef))		// If this evaluates to false, then it doesn't have a value
		return;
	var colData;
	// If this member is present, then there is a table header, so set that up
	if (tableDef.hasOwnProperty("tableHeader")) {	// User indicates that the first row is to be considered header data, so set that up special in the <table> structure
		// Create the opening of the header and include a identifier that is "thead" and the passed table ID for identification and styling purposes
		tHdr = "<thead id=\"thead" + tblId + "\"><tr>";
		for (col = 0; col < tableDef.tableHeader.length; col++) {
			colData = tableDef.tableHeader[col].trim();
			if (colData.length === 0)
				continue;
			tHdr += "<th>" + colData + "</th>";
		}
		tHdr += "</tr></thead>";
	}

	// To finish up, the passed object must have a tableData member that is the array of data rows
	if (!tableDef.hasOwnProperty("tableData"))
		return (tableStart + tHdr + tableRows + tableEnd);

	// Build up each row - and avoid putting in zero-length fields
	for (var row = 0; row < tableDef.tableData.length; row++) {
		tableRows += '<tr ' + EvenOddClass(row) + '>';
		colData = tableDef.tableData[row];
		for (col = 0; col < colData.length; col++) {
			var field = colData[col].trim();
			if (field.length === 0)
				continue;
			tableRows += "<td>" + field + "</td>";
		}
		tableRows += "</tr>";
	}

	return (tableStart + tHdr + tableRows + tableEnd);
}

/* GetEvtTarget()
 * Purpose:	Setup the event target given a button press or keypress or any event
 */
function GetEvtTarget(e)
{
	var evt = window.event || e;
	if (!evt.target) //if event obj doesn't support e.target, presume it does e.srcElement
		evt.target = evt.srcElement; //extend obj with custom e.target prop
	return evt.target;
}

// Set the value of a cookie for this session
function SetCookie(cname, cvalue, exdays)
{
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Return the value of the named cookie
function GetCookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

/* CalcHeightofDiv()
 * Purpose:	Find the height of a <div> given the id of that section
 * Inputs:	the jQuery selector to use to get at the root element whose height you want to measure
 *				NOTE: This should be an id (e.g. #myId) and not a class because we want to identify a specific element
 * Returns:	the pixel height of the indicated element
 */
function CalcHeightofDiv(divElem)
{
	var totalHeight = 0;

	$(divElem).children().each(function ()
	{
		var elemHt = 0;
		if ($(this).children().length > 0) {
			elemHt = CalcHeightofDiv(this);
			console.info("Found child ht: " + elemHt + "id: " + this);
		}
		else {
			elemHt = $(this).outerHeight(true);
		}

		totalHeight += elemHt;

		console.info("height of elem is " + elemHt + ", total is " + totalHeight);
	});

	return totalHeight;
}

/* SetOnlyTextOnButton()
    Purpose:    If you have an element that has text that you want to replace, but there are more child elements
                after your text within the tag you're changing, you can't just use @#xxx.text("newtext") on that
                element or it will obliterate the other child elements. Using this function will preserve the
                child nodes that are beyond the text in the element you want to change.
    Inputs:     the jQuery selector for the elemetn you want to alter. Note: Its best if this is an ID attribute
                    on that element (e.g. id="myelement") and so the selector will be of the form "#myElement".
                the new text to put into that element
    Assumes:    the text you want to change is the FIRST child node given the selector you pass in
    Outputs:    the first node in the elemnt selected using your selector will be changed so that it only contains
                    the text you passed in
*/
function SetOnlyTextOnButton(theId, newtext)
{
	var cache = $(theId).children();
	$(theId).text(newtext).append(cache);
}

// Utility function to make a nice <li> list for pull downs out of a string array
function MakePulldown(elemAry)
{
	var list = "";
	for (var j = 0; j < elemAry.length; j++) {
		list += '<li><a href="#">' + elemAry[j] + '</a></li>';
	}
	return list;
}

/* The following configuration variables are used in the GetSessionValue() function. It is up to the caller to reset these 
	if specific actions are needed if an error is encountered when trying to get the Session value
*/
var ShowFatalErr = false;
var HomePage = null;

/* GetSessionValue(key)
   GetSessionValue(key, whatIsIt)
   SetSessionValue(key, value)
   ClearSessionValue(key)
	Purpose:	Functions that let you manager storing and retrieving arbitray objects from the session storage. This storage
				stays around as long as a user's session is active.  These values are cleared when the page session ends. 
				A page session lasts for as long as the browser is open and survives over page reloads and restores. 
				Note that opening a page in a new tab or window will cause a new session to be initiated.
	Inputs:		key - the identifier of the value you are affecting
				value - a value that will be put into the storage for the passed key. It can be any object up to memory limitations
				whatIsIt - an (optional) human readable description of what the key contains to show in case there is an error
	Config:		ShowFatalErr	If this configuration variable is true, then we will show a fatal error message about this
				HomePage		If a fatal error is encountered and this value is set to a URL, then transfer to that page
	Returns:	the value of the indicated key or null if not found
*/
function GetSessionValue(sessionKey, whatIsIt)
{
	if (!checkObject(whatIsIt))
		whatIsIt = sessionKey;

	var retVal = null;
	if (sessionStorage[sessionKey])
		retVal = sessionStorage.getItem(sessionKey);
	else {
		if (ShowFatalErr) {
			FatalError("Cannot find critical session key: " + whatIsIt + " in your session. Aborting operation.", 0, errActionGotoMain);
		}
		if (Strings.hasValue(HomePage)) {
			window.location = HomePage;
		}
	}

	return retVal;
}

// Wrapper so that the Get function has a matching Set function
function SetSessionValue(key, value)
{
	sessionStorage.setItem(key, value);
}

function ClearSessionValue(key)
{
	// Remove saved data from sessionStorage
	sessionStorage.removeItem(key);
}

function ClearAllSessionValues()
{
	sessionStorage.clear();
}

// ------------------------------------ Error Display and Processing Utilities -----------------------------

// The values indicating the action that should be taken after notification of the fatal error
var errActionGotoMain = 1;
var errActionReturn = 2;

// Keys use in the sessionStorage relating to showing the fatal errors
var keyErrMessage = "ErrMessage";
var keyErrCode = "ErrCode";
var keyErrAction = "ErrAction";

/* ShowError(whatToSay, jqXHR, textStatus, errorThrown)
	Purpose:	Provide a standardized way to show error messages across the website
	Inputs:		a text blurb of what we were trying to do when the error occurred
				the 3 parameters that are passed into the JQ .fail() function, i.e.
			the calling object with the error details,
			the error text status message,
			the string of the error thrown - more specific than textStatus
	Outputs:	This will bring up an alert() dialog (for now) and write the resulting error to the console
*/
function ShowError(whatToSay, jqXHR, textStatus, errorThrown)
{
	var baseErrMsg = "Error (" + textStatus + ") received when " + whatToSay + ". Error is: " + errorThrown;
	var theErr = "";
	if (jqXHR != undefined && jqXHR != NaN && jqXHR.responseJSON != null) {
		theErr = ConcatStrings(',', jqXHR.responseJSON.Message, jqXHR.responseJSON.error, jqXHR.responseJSON.error_description);
	}
	var errMsg = baseErrMsg + ". Error details: " + theErr;
	console.log(errMsg);
	alert(errMsg);
}

/* FatalError()
	Purpose:	Provide a general error reporting and recovery function for any page to use. Here we will set up
				the values in sessionStorage that the error reporting page expects to see and then bring up that
				page. This avoids showing an alert() that interrupts the flow of the website
	Inputs:		the text of the error to show
				a numeric error code to show (pass zero if this should be ignored)
				a key to the action to take after the user acknowledges the error
					main	Return to main menu
					return	simply return to the caller
	Assumes:	the page "Err00-FatalError.html" is present in the website
*/
function FatalError(errText, errCode, action)
{
	// Store the values that the fatal error page is going to need 
	sessionStorage.setValue(keyErrMessage, errText);
	sessionStorage.setValue(keyErrCode, errCode);
	sessionStorage.setValue(keyErrAction, action);
	// Bring up the error HTML page and fill in the details
	window.location = "Err00-FatalError.html";
}

/* FatalErrorDone()
	Purpose:	This is called by the error display page after the user has acknowledged or otherwise dismissed the error
				Depending on the desired action we will either restart at the beginng or perform some other action
	Inputs:		It is assumed the following have been set in the sessionStorage so that we can complete our purpose
		keyErrAction	value	The desired action value must be set so we know what to do; Default is to return to main menu
*/
function FatalErrorDone()
{
	var action = GetSessionValue(keyErrAction);
	switch (action) {
		case errActionGotoMain:
			window.location = "Cm00-MainMenu.html";
			break;
		case errActionReturn:
			break;
		default:
			break;
	}
}

// ------------------------------------ Report Store/retrieve Utilities -----------------------------

/* StoreReport()
 * Purpose:		Store a report object in the sessionStorage in a way that lets us find it later
 *				if we know the filtering criteria by which the report was made. (See details on
 *				the GetStorageKeyForReport() about how that works)
 * Inputs:		the object containing the report we must store,
 *				the report type - must be "Quick", "All", "Revenue", or "Jackpot"
 *				the report filter parameters - the start and end dates and the accounting start time
 * Outputs:		the report will be stored in the Session Storage
 *				the key used to store this report will be put into sessionStorage.LastProLinkKey
 *					so that the user can easily get that report information w/o knowing the filtering criteria
 * Returns:		true if the report was NOT already in storage, false otherwise
 */
function StoreReport(report, repType, start, end, time)
{
	var reportKey = GetStorageKeyForReport(repType, start.toString(), end.toString(), time.toString());
	var sfx = GetShortFileCompatibleDateString(start) + " to " + GetShortFileCompatibleDateString(end);

	// See if we already have stored our report in here
	var reportData = sessionStorage.getItem(reportKey);
	if (reportData === null) {
		var sReport = JSON.stringify(report);
		SetSessionValue(reportKey, sReport);
		console.log("[StoreReport] Newly storing report data for report type: " + repType + ", for dates: " + sfx + " in key saved as in (partial)key: " + reportKey.substr(0, 40));
	}
	else {
		console.log("[StoreReport] Found existing report data for report type: " + repType + ", for dates: " + sfx + " in key saved as in (partial)key: " + reportKey.substr(0, 40));
	}

	SetSessionValue("LastProLinkKey", reportKey);
	SetSessionValue("ReportType", repType);
	SetSessionValue("ReportDateSuffix", sfx);

	console.log("[StoreReport] Stored report type: " + repType + ", for dates: " + sfx + " in key saved as LastProLinkKey");
	return (reportData === null);
}

/* GetStorageKeyForReport()
 * Purpose:		Create a dictionary key that we can use to store and retrieve a report so that we have
 *				separate storage for the type of report and the parameters that made it. We will be storing
 *				the dictionary of reports in the user's session in case they re-run it
 * Inputs:		the report type - must be "Quick", "All", "Revenue", or "Jackpot"
 *				the report filter parameters - the start and end dates and the accounting start time
 * Returns:		a 'hash key' that consists of the contents of all the inputs to know we have a unique key for
 *					that set of filtering criteria
*/
function GetStorageKeyForReport(repType, start, end, time)
{
	var key = repType;
	key += "!" + start.toString;
	key += "!" + end.toString;
	key += "!" + time.toString;
	console.log("Key is: " + key);
	return key;
}

/* GetStoredReport()
 * Purpose:		Given the filtering information about a report, return it from system storage
 * Inputs:		the report type - must be "Quick", "All", "Revenue", or "Jackpot"
 *				the report filter parameters - the start and end dates and the accounting start time
 * Returns:		the report as a JS object, or null if it was not found
 */
function GetStoredReport(repType, start, end, time)
{
	var reportKey = GetStorageKeyForReport(repType, start, end, time);
	// See if we already have stored our report in here
	var sReport = sessionStorage.getItem(reportKey);
	var report = "";
	if (sReport != null && sReport.toString().length > 0)
		report = JSON.parse(sReport);
	return report;
}

/* GetLastStoredReport()
 * Purpose:		Since this system stores the last key used to store a report, we can just grab that
 *				key and retrieve the last report from storage.
 * Returns:		the report as a JS object, or null if it was not found
 */
function GetLastStoredReport()
{
	var report = null;
	var lastKey = sessionStorage.getItem("LastProLinkKey");
	if (lastKey) {
		console.log("[GetLastStoredReport] there is a LastProLinkKey in sessionStorage, partial value is " + lastKey.substr(0, 40));
		report = JSON.parse(sessionStorage.getItem(lastKey));
	}
	else {
		console.log("lastKey is null! no last saved report in sessionStorage! Returning null report content.");
	}

	return report;
}

// Return a class specifier depending on the row number
function EvenOddClass(row)
{
	return "class=" + (((row % 2) === 0) ? "Even" : "Odd");
}

/* Read files using FileReader (newly supported in HTML5)
		docs here: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 * Assumes you have something like this in the HTML
	<input type="file" id="input">
 and then you can get the file the user indicated with this
	var selectedFile = $('#input')[0].files[0];
 Input:	a File object - this  is generally retrieved from a FileList object returned
			as a result of a user selecting files using the <input> element,
			, from a drag and drop operation's DataTransfer object, 
			or from the mozGetAsFile() API on an HTMLCanvasElement. 
			In Gecko, privileged code can create File objects representing any local file 
			without user interaction
	*/
function ReadFile(file)
{
	var reader = new FileReader();
	reader.onload = function (aImg)
	{
		return aImg;
	};

	reader.onerror = function (err)
	{
		var domErr = reader.error;

		console.log("File Read error: " + domErr.name);
	};

	reader.readAsText(file);
}
/* Extra junk: 		return function (e) {
			return (e.target.result);	// This appears to be the file contents?
		};
	};
*/

/* If there is a read error, I can get that info from (FileReader object).error


/* NOPE - won't work
Text File Reading Support functions, the following reads files on the user's local system
 * CheckFileAPI()	Use this first to determine if the system you're on allows you to read a file
 * readText(file)	Reads in the entire file and returns it in a string
 * readTextChunk( file, start, size)	Read a chunk out of a file and return it
 *
 * This function will read a file on the server and return it to JavaScript via Ajax

 * 
/**
	 * Check for the various File API support.
	 */
function CheckFileAPI()
{
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		reader = new FileReader();
		return true;
	} else {
		alert('The File APIs are not fully supported by your browser. Fallback required.');
		return false;
	}
}

/**
 * read text input
 */
function ReadLocalTextFileBetter(filePath)
{
	var output = ""; //placeholder for text output
	try {
		reader.onload = function (e)
		{
			output = e.target.result;
			return (output);
		};

		// Execute the file read - when it completes, it'll use the above function
		// to deliver the data
		reader.readAsText(filePath);
	}
	catch (exception) {
		console.log("Exception when trying to simply read file: " + filePath + ", going to use ActiveXObject now");
		if (ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
			try {
				reader = new ActiveXObject("Scripting.FileSystemObject");
				var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
				output = file.ReadAll(); //text contents of file
				file.Close(); //close file "input stream"
				return output;
			}
			catch (e) {
				if (e.number == -2146827859) {
					alert('Unable to access local files due to browser security settings. ' +
					 'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
					 'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
				}
			}
		}
	}

	return null;
}

/* ReadLocalTextFile()
 * Purpose:	A smaller version of the file reader, that is not as robust as the above, but
			easier to read :-)
	Inputs:	the name of the file to read - and be sure that it starts with file://, e.g.
		file:///c:/path/path2/myfile.txt
	Returns:	the content of the file
*/
function ReadLocalTextFile(file)
{
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function ()
	{
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status === 0) {
				var allText = rawFile.responseText;
				return (allText);
			}
		}
	};
	rawFile.send(null);
}

/* GetFileFromServer()
 * Purpose:	Ajax call that browser JS can use to get a file off the server. 
 * Inputs:	the path to the file on the server,
			a function pointer that takes one parameter, the contents of the file requested
 */
var reader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP');
var fileLoadUserCb = null;

function GetFileFromServer(fileOnServer, callbackWithData)
{
	fileLoadUserCb = callbackWithData;
	reader.open('get', 'test.txt', true);
	reader.onreadystatechange = callUserFunc;
	reader.send(null);
}

function callUserFunc()
{
	if (reader.readyState === 4) {
		if (fileLoadUserCb != null) {
			fileLoadUserCb(reader.responseText);
		}
	}
}

/* Allow the user to save something as a CSV (?) - Example of how it is used
	ExportToCSV.apply();
 * which would be in the onClick() function
 */
function ExportToCSV(thecsv)
{
	// Data URI
	//	var test = encodeURIComponent(thecsv);
	var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(thecsv);
	console.log("CSV Data Export as: " + csvData.substr(0, 400));
	$(this).attr({ 'href': csvData, 'target': '_blank' });
}


/* StoreObjectIntoSession()
	Purpose:	Create the ability to store complex objects into the session storage by 
				converting it to a json representation first
*/
function StoreObjectIntoSession(keyName, keyValue)
{
	var objJson = JSON.stringify(keyValue);
	// Store the complex object as a json string
	SetSessionValue(keyName, objJson);
}

/* RetrieveObjectFromSession()
	PUrpose:	Get a more complex object from session storate that has previously been stored as a jSon string
	Inputs:		the name of the key to use to get the object value
*/
function RetrieveObjectFromSession(keyName)
{
	var retVal = null;
	var theObj = Strings.getStringValue(GetSessionValue(keyName));
	if (theObj.length > 0) {
		retVal = JSON.parse(theObj);
	}

	return retVal;
}