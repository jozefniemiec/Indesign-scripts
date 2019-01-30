

/* Copyright 2018, Józef Niemiec
    August 1, 2018
    email: kontakt@jozefniemiec.pl */

const SCRIPT_NAME = "Create hyperlinks for inactive TOC";

const SCRIPT_INFO = "Select the paragraphs in which you want to create hyperlinks. \n \n" +
  "The first or last word in the paragraph will be considered as number of the target page."

var document, paragraphs, count = 0;
var isFirstWordIsPageNumberRadioButton;

app.doScript(
  main,
  ScriptLanguage.JAVASCRIPT, [],
  UndoModes.ENTIRE_SCRIPT,
  SCRIPT_NAME
);

function main() {
  preCheck();
  var dialog = createDialog();
  if (dialog.show()) {
    createHyperlinks();
  }
  alert(count + " hyperlink" + ((count == 1) ? " was" : "s were") + " created", SCRIPT_NAME);
}

function createDialog() {
  var myDialog = app.dialogs.add({
    name: SCRIPT_NAME,
    canCancel: true
  });
  with(myDialog) {
    with(dialogColumns.add()) {
      with(borderPanels.add()) {
        staticTexts.add({
          staticLabel: "The target page number is at the "
        });
        var digitsRadioButton = radiobuttonGroups.add();
        with(digitsRadioButton) {
          isFirstWordIsPageNumberRadioButton = radiobuttonControls.add({
            staticLabel: "beginning",
            checkedState: true
          });
          radiobuttonControls.add({
            staticLabel: "end"
          });
        }
        staticTexts.add({
          staticLabel: " of the paragraph."
        });
      }
    }
  }
  return myDialog;
}

function createHyperlinks() {
  var text, words;
  for (i = 0; i < paragraphs.length; i++) {
    try {
      text = paragraphs[i].texts;
      words = paragraphs[i].words;
      pageNumber = (isFirstWordIsPageNumberRadioButton.checkedState) ? words.firstItem().contents : words.lastItem().contents;
    } catch (e) {
      continue;
    }
    makeHyperlink(text, pageNumber)
  }
}


function makeHyperlink(text, pageNumber) {
  var source, destination, hyperlink;
  try {
    source = document.hyperlinkTextSources.add(text);
    if (document.pages.itemByName(pageNumber).isValid)
      destination = document.hyperlinkPageDestinations.add(document.pages.itemByName(pageNumber));
    else {
      alert("Page \"" + pageNumber + "\" do not exist!", SCRIPT_NAME);
      destination = null;
    }
    hyperlink = document.hyperlinks.add(source, destination, {
      name: "TOC entry: " + ++count + " to page: " + pageNumber
    });
  } catch (e) {
    alert(text.everyItem().contents + "\n\n" + e, SCRIPT_NAME);
  }
}

function preCheck() {
  try {
    document = app.activeDocument;
    paragraphs = app.selection[0].paragraphs.everyItem().getElements();
  } catch (e) {
    alert(SCRIPT_INFO, SCRIPT_NAME);
    exit();
  }
  var existingHyperlinks = checkExistingHyperlinks();
  if (existingHyperlinks.length > 0) {
    alertAboutExistingHyperlinks(existingHyperlinks)
  }
}

function checkExistingHyperlinks() {
  var existingHyperlinkTextSources = [];
  for (var i = 0; i < paragraphs.length; i++) {
    existingHyperlinkTextSources.push(paragraphs[i].findHyperlinks());
  }
  existingHyperlinkTextSources = [].concat.apply([], existingHyperlinkTextSources);
  return existingHyperlinkTextSources;
}

function alertAboutExistingHyperlinks(existingHyperlinkTextSources) {
  for (var i = 0; i < existingHyperlinkTextSources.length; i++) {
    $.writeln(existingHyperlinkTextSources[i].sourceText);
    app.select(existingHyperlinkTextSources[i].sourceText);
    var result = confirm("Existing hyperlink: \'" + existingHyperlinkTextSources[i].name + "\' must be removed in order to create the new one. \n\n Continue?", false);
    if (result) {
      existingHyperlinkTextSources[i].remove();
    } else {
      exit();
    };
  }
}
