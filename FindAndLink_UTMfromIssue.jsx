//DESCRIPTION: Sucht nach Domains um sie effizient mit Hyperlinks zu hinterlegen
// © 2023, Patrice Büttiker

/*
The Script displays a Find/Link window. Similar to a Find/Change- or Search/Replace function. 
But it searches for domain or URL patterns and proposes an URL to set a hyperlink on the found text.
In this version a part of the tracking link ist made of the woodwing studio publication and issue.
The script checks first if signed in at one of two supported servers (can be changed below) and checks all articles out.
*/

/*
MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// important, otherwise "palette" doesn't work
#targetengine "Main"

////////////////////////////////////////////////////////////
// Change to your Studio servers and tracking link source //
////////////////////////////////////////////////////////////
var serverUrl1 = "https://myserver/StudioServer";
var serverUrl2 = "https://myserver2/StudioServer";
var UTMsource = "?utm_source=yourSource&utm_medium=referral&utm_campaign=";

var sessionObject = app.entSession;
var activeSession = sessionObject.activeUrl

// Check if signed in in Studio – because utm parameters will be created from Studio publication and issue
if (activeSession != serverUrl1+"/index.php" && activeSession != serverUrl2+"/index.php") {
	alert ("Nicht in Woodwing angemeldet. Bitte melde dich zuerst an.\n"+activeSession+"\n"+serverUrl2+"/index.php");
	exit();
}

if (app.documents.length > 0) {
    var doc = app.documents[0];
} else {
    alert("Es ist kein Dokument geöffnet.");
    exit();
}

app.doScript(Main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Suche und Verlinke");

function Main() {


    // check out all Articles
    var _articles = doc.managedArticles;
    for (var _i = 0; _i < _articles.length; _i++) {
        try {
            _articles[_i].checkOut();
        } catch(e) {
            //alert(e.description);
        }
    } 

    // get Studio Metadata
    var entMetaData = doc.entMetaData;
    var issueName = entMetaData.get("Core_Issue");
    var brandName = entMetaData.get("Core_Publication");

    // define UTM parameter for the current issue
    var UTMofCurrentIssue = UTMsource + brandName + issueName;

    // Part 1: Find all URLs 
    // Word end regex doesn't work in script \>: (\bhttps?:\/\/)?(www\.)?[^\s]{3,}\.\w\w\w?\>(\/[^\s]+)*
    // so it's done with positive lookahead: (?=[\s\/\.])
    var hyperlinkPattern = /(\bhttps?:\/\/)?(www\.)?[^\s]{3,}\.\w\w\w?(?=[\s\/\.])(\/[^\s]+)*/ig;
    var matches = [];

    // Loop through all stories in the document
    for (var i = 0; i < doc.stories.length; i++) {
        var story = doc.stories[i];
        var text = story.contents;
        var match;

        // Search for hyperlink patterns in the story
        while (match = hyperlinkPattern.exec(text)) {
            // Store each match with its story and position
            matches.push({
                story: story,
                index: match.index,
                text: match[0]
            });
        }
    }

    //////////////////////////////
    // Start processing matches //
    //////////////////////////////
    processNextMatch();


    // Part 2: Process each match one by one -> because no await is possible process with shift in an array
    function processNextMatch() {
        if (matches.length === 0) {
            return; // No more matches to process
        }

        var match = matches.shift(); // Get the next match

        // Select the text
        app.select(match.story.characters.itemByRange(match.index, match.index + match.text.length - 1));

        // Set focus to the selected text and zoom to 150%
        app.activeWindow.zoomPercentage = 150;

        // Add HTTPS
        if (match.text.indexOf("https://") == 0) {
            propUrl = match.text;
        } else if (match.text.indexOf("http://") == 0) {
            propUrl = "https://" + match.text.slice(7);
        } else {
            propUrl = "https://" + match.text;
        }
        // Add UTM parameter
        propUrl = propUrl + UTMofCurrentIssue;

        // Create a palette window
        var w = new Window('palette', 'Hyperlink'); //new Window("dialog"); // new Window("window"); //new Window("palette"); //palette is not modal and needs #targetengine
        w.text = "Suchen und Verlinken"; 
        w.orientation = "column"; 
        w.alignChildren = ["center","top"]; 
        w.spacing = 10; 
        w.margins = 16; 
    
        var foundUrl = w.add("statictext", undefined, undefined, {name: "foundUrl"}); 
        foundUrl.text = match.text; 
        foundUrl.preferredSize.width = 445; 
    
        var proposedUrlInput = w.add('edittext {properties: {name: "proposedUrlInput"}}'); 
        proposedUrlInput.text = propUrl; 
        proposedUrlInput.preferredSize.width = 460; 
    
        // BUTTONS
        // =======
        var Buttons = w.add("group", undefined, {name: "Buttons"}); 
        Buttons.orientation = "row"; 
        Buttons.alignChildren = ["left","center"]; 
        Buttons.spacing = 10; 
        Buttons.margins = 0; 

        // To Do --> create Logic to display different button if the selection already has al Link
        var hasHyperlink = false;
        for (var i = 0; i < doc.hyperlinks.length; i++) {
            if (doc.hyperlinks[i].source.sourceText == app.selection[0]) {
                hasHyperlink = true;
                break;
            }
        }
    
        var btnApply = Buttons.add("button", undefined, undefined, {name: 'ok'}); 
        hasHyperlink ? btnApply.enabled = false : btnApply.enabled = true;
        btnApply.text = "verlinken"; 
    
        var btnSkip = Buttons.add("button", undefined, undefined, {name: "btnSkip"}); 
        btnSkip.text = "überspringen"; 
    
        var btnRemove = Buttons.add("button", undefined, undefined, {name: "btnRemove"}); 
        hasHyperlink ? btnRemove.enabled = true : btnRemove.enabled = false; 
        btnRemove.text = "Hyperlink entfernen"; 
    
        var btnCancel = Buttons.add("button", undefined, undefined, {name: "btnCancel"}); 
        btnCancel.text = "abbrechen"; 
        
        // set the default button on enter
        w.defaultElement = btnApply;
        
        // display the dialog
        w.show();
        //w.center(); // This will center the window
        var top = w.bounds[1] + 200; // This will move the window 200px down
        var left = w.bounds[0];
        var right = w.bounds[2];
        var bottom = top + (w.bounds[3] - w.bounds[1]);
        w.bounds = [left, top, right, bottom];
        
            
        // Events (Custom)
        // =======
        // Abbrechen
        btnCancel.onClick = function() {
            w.close()
            exit();
        }
    
        // Anwenden
        btnApply.onClick = function() {
            var hyperlinkSource = doc.hyperlinkTextSources.add(app.selection[0]);
            var hyperlinkDestination = doc.hyperlinkURLDestinations.add(proposedUrlInput.text);
            doc.hyperlinks.add(hyperlinkSource, hyperlinkDestination).name = app.selection[0].contents;;
            // Close the window and move to the next search result
            w.close();
            processNextMatch(); // Process the next match
        }
    
        // Überspringen
        btnSkip.onClick = function() {
            // Close the window and move to the next search result
            w.close();
            processNextMatch(); // Process the next match
        }

        // Entfernen
        btnRemove.onClick = function() {
            var hyperlinkTextSources = doc.hyperlinkTextSources;
            for (var i = hyperlinkTextSources.length - 1; i >= 0; i--) {
                var hyperlinkTextSource = hyperlinkTextSources[i];
                if (hyperlinkTextSource.sourceText == app.selection[0]) {
                    hyperlinkTextSource.remove();
                    break;
                }
            }
            btnRemove.enabled = false;
            btnApply.enabled = true;
        }

    }

} // main
