# FindAndLink
InDesign-Script to find domains in a document and set hyperlinks in a efficient way

## Description
The script displays a Find/Link window. Similar to a Find/Change- or Search/Replace function. 
But it searches for domain or URL patterns and proposes an URL to set a Hyperlink on the found text.
In one version a part of the tracking link ist made of the woodwing studio publication and issue.
The script checks first if signed in at one of two supported servers (can be changed below) and checks all articles out.
In the other version—the tracking infomration can be left empty or be defined at l46/47. It works without Woodwing Studio.

![alt text](https://github.com/patricedaniel/FindAndLink/blob/main/FindAndLinkGUI.png?raw=true)


## Requirements
Tested in Adobe InDesign 2022.
FindAndLink_UTMfromIssue.jsx works only together with Woodwing Studio for InDesign (any version).

## Installation
https://helpx.adobe.com/indesign/using/scripting.html

The Scripts panel is where you run scripts without leaving InDesign. The Scripts panel displays the scripts that are located in the Scripts folders in the InDesign application folder and in your Preferences folders.
Select Windows > Utilities > Scripts to open the Scripts Panel. If you create or receive a script, you can place it in the Scripts Panel folder, so it shows up in the Scripts panel.

### macOS
Users/[username]/Library/Preferences/Adobe InDesign/[version]/[language]/Scripts/Scripts Panel

### Windows XP
Documents and Settings\[username]\Application Data\Adobe\InDesign\[version]\[language]\Scripts\Scripts Panel

### Windows Vista and Windows 7
Users\[username]\AppData\Roaming\Adobe\InDesign\[version]\[language]\Scripts\Scripts Panel
