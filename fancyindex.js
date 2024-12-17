var copyUrlClipboard = new ClipboardJS("#btnCopyURL", {
    container: document.querySelector("dialog"),
    text: function() {
        return document.querySelector("dialog").getAttribute("url");
    }
});

copyUrlClipboard.on("success", () => {
	clickCloseInfo();
});

function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function clickCloseInfo() {
    var dialog = document.querySelector("dialog");
    dialog.removeAttribute("url");
    dialog.close();
}

function clickSearch() {
    var listOfItems = document.getElementsByClassName("search");
    for (var i = 0; i < listOfItems.length; ++i) {
        var item = listOfItems[i];
        item.classList.remove("search-novisible");
    }
    var listOfItems = document.getElementsByClassName("no-search");
    for (var i = 0; i < listOfItems.length; ++i) {
        var item = listOfItems[i];
        item.classList.add("search-novisible");
    }
    document.getElementById("search-field").select();
}

function clickResetSearch() {
    var listOfItems = document.getElementsByClassName("no-search");
    for (var i = 0; i < listOfItems.length; ++i) {
        var item = listOfItems[i];
        item.classList.remove("search-novisible");
    }
    var listOfItems = document.getElementsByClassName("search");
    for (var i = 0; i < listOfItems.length; ++i) {
        var item = listOfItems[i];
        item.classList.add("search-novisible");
    }
    document.getElementById("search-field").value = "";

    var listOfItems = document.getElementsByClassName("item");
    for (var i = 0; i < listOfItems.length; ++i) {
        listOfItems[i].classList.remove("resultsearch-novisible");
    }
}

var templateDialog = `    
    <div>
        <li class="mdl-list__item item">
            <span class="mdl-list__item-primary-content">
            <span class="mdl-list__item-avatar specColor"><i class="material-icons">specIcon</i></span>
                specLib
            <span>
        </li>
        <div class="mdl-dialog__content" id="dialog-content">
        </div>
    </div>`;

function clickGetInfo(id) {
    var dialog = document.querySelector("dialog");
    var showDialogButton = document.querySelector("#show-dialog");
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    var listOfItems = document
        .getElementById("list")
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");

    var item = listOfItems[id];
    var itemMetadata = [];

    lib = item.children[0].children[0].textContent;
    size = item.children[1].textContent;
    dte = item.children[2].textContent;

    itemMetadata.push(lib, size, dte);

    if (lib.substring(lib.length - 1) == "/") {
        icon = "folder_open";
        color = "mdl-color--accent";
    } else {
        icon = "insert_drive_file";
        color = "mdl-color--accent-dark";
    }
    while (document.getElementById("templateDialog").firstChild) {
        document
            .getElementById("templateDialog")
            .removeChild(document.getElementById("templateDialog").firstChild);
    }
    var elt = htmlToElement(
        templateDialog
            .replace("specIcon", icon)
            .replace("specLib", lib)
            .replace("specColor", color)
    );
    document.getElementById("templateDialog").appendChild(elt);

    var listOfItems = document
        .getElementById("list")
        .getElementsByTagName("thead")[0]
        .getElementsByTagName("th");
    for (var i = 0; i < listOfItems.length; ++i) {
        var info = document.createElement("div");
        info.innerHTML =
            listOfItems[i].children[0].textContent + " : " + itemMetadata[i];
        document.getElementById("dialog-content").appendChild(info);
    }

    var url = window.location.href;
    url = url.substr(0, url.lastIndexOf("/") + 1);
    dialog.setAttribute("url", url + encodeURIComponent(lib));

    // search info and insert into dialog
    dialog.showModal();
}

function sortNumbers(a, b) {
    return a[1] > b[1] ? 1 : b[1] > a[1] ? -1 : 0;
}

// Re-order directory listing by number in file name in ascending order
function sortDirectoryListingByNumber() {
    var templateItem = `
        <li class="mdl-list__item item">
            <a name="specLib" href="specHref" style="width:99%">
                <span class="mdl-list__item-primary-content">
                    <span class="mdl-list__item-avatar specColor"><i class="material-icons">specIcon</i></span>
                    <span>
                        specLib
                        <span class="second_line">specInfo</span>
                    </span>
                </span>
            </a>
            <span class="mdl-list__item-secondary-content">
                <a class="mdl-list__item-secondary-action mdl-color-text--accent specViewGetInfo" href="#" onclick="clickGetInfo(specId)">
                    <i class="material-icons">more_vert</i>
                </a>
            </span>
        </li>
    `;

    var href = "";
    var lib = "";
    var size = "";
    var dte = "";
    var icon = ""; // folder_open or insert_drive_file
    var color = ""; // mdl-color--accent or mdl-color--accent-dark
    var viewGetInfo = "";
    var txtInfo = "";
    var typOfSort = "name";

    var listOfItems = document
        .getElementById("list")
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");

    var numberMap = new Map();
    for (var i = 0; i < listOfItems.length; i++) {
        numberMap.set(i, Number(listOfItems[i].innerText.match(/\d{1,}/)));
    }

    // Sort numbers in ascending order and make a copy of the sorted list
    var sortedNumberMap = Array.from(numberMap).sort(sortNumbers);
    var sortedListOfItems = [];
    for (var i = 0; i < listOfItems.length; i++) {
	var clonedItem = listOfItems[sortedNumberMap[i][0]].cloneNode(true);
	sortedListOfItems.push(clonedItem);
    }

    // Create the sorted elements and append them to parent list
    for (var i = 0; i < sortedListOfItems.length; i++) {
	var sortedItem = sortedListOfItems[i];

	href = sortedItem.children[0].innerHTML.match(/href=\"(.*?)\"/)[1];
	listOfItems[i].children[0].children[0].href = sortedItem.children[0].children[0].href;
	listOfItems[i].children[0].children[0].title = sortedItem.children[0].children[0].title;
	listOfItems[i].children[0].children[0].text = sortedItem.children[0].children[0].text;

	lib = (i == 0) ? "Parent directory" : sortedItem.children[0].innerText;
	size = sortedItem.children[1].textContent;
	listOfItems[i].children[1].textContent = size;

	dte = sortedItem.children[2].textContent;
	listOfItems[i].children[2].textContent = dte;

	viewGetInfo = "";
	txtInfo = "";

	if (lib.substring(lib.length - 1) == "/") {
	    icon = "folder_open";
	    color = "mdl-color--accent";
	    href += "?NUM";
	    lib = lib.substring(0, lib.length - 1);
	} else {
	    icon = "insert_drive_file";
	    color = "mdl-color--accent-dark";
	}
	if (size == "-") {
	    size = "";
	}
	if (dte == "-") {
	    dte = "";
	}
	if (size == "" && dte == "" && lib == "Parent directory") {
	    icon = "arrow_back";
	    color = "mdl-color--primary";
	    viewGetInfo = "getinfo-novisible";
	    href += "?NUM";
	}
	if (typOfSort == "date") {
	    txtInfo = dte;
	}
	if (typOfSort == "size") {
	    txtInfo = size;
	}

	document.getElementById("listItems").appendChild(
	    htmlToElement(
	        templateItem
	            .replace("specHref", href)
	            .replace("specIcon", icon)
	            .replace("specInfo", txtInfo)
	            .replace("specColor", color)
	            .replace("specLib", lib)
	            .replace("specLib", lib)
	            .replace("specViewGetInfo", viewGetInfo)
	            .replace("specId", i)
	    )
	);
    }
}

// GLOBAL

function runSearch() {
    searchregex = document.getElementById("search-field").value;
    var listOfItems = document.getElementsByClassName("item");
    for (var i = 0; i < listOfItems.length; ++i) {
        var item = listOfItems[i];
        value = item.getElementsByTagName("a")[0].name;
        if (value.match(new RegExp(searchregex, 'i'))) {
            item.classList.remove("resultsearch-novisible");
        } else {
            item.classList.add("resultsearch-novisible");
        }
    }
}

//// Get enter in the input field search
var input = document.getElementById("search-field");
input.addEventListener("keyup", function(event) {
    event.preventDefault();
    runSearch();
});


// manage title, bar, ...
var currentPath = document.getElementById("original_fancyindex").childNodes[0].textContent.trim();
document.getElementById("currentPathTitle").innerHTML = currentPath;
var arrayOfCurrentPath = currentPath.split("/");
arrayOfCurrentPath.splice(0, 1);
arrayOfCurrentPath.splice(arrayOfCurrentPath.length - 1, 1);

if (arrayOfCurrentPath.length > 0) {
    document.getElementById("currentTitle").innerHTML =
        arrayOfCurrentPath[arrayOfCurrentPath.length - 1];
} else {
    document.getElementById("currentTitle").innerHTML = "Root";
}
document.getElementById("homelink").href = "../".repeat(arrayOfCurrentPath.length);
document.getElementById("homebtn").href = "../".repeat(arrayOfCurrentPath.length);

// manage sort
if (window.location.href.split("?")[1] == "C=M&O=D") {
    document.getElementById("sortByDate").href = "?C=M&O=A";
}
if (window.location.href.split("?")[1] == "NUM") {
    sortDirectoryListingByNumber();
}
if (window.location.href.split("?")[1] == "C=N&O=D") {
    document.getElementById("sortByName").href = "?C=N&O=A";
}
if (window.location.href.split("?")[1] == "C=S&O=D") {
    document.getElementById("sortBySize").href = "?C=S&O=A";
}

// menu
var templateLink = `
    <li class="mdl-list__item mdl-navigation__link">
        <a href="specHref">
            <span class="mdl-list__item-primary-content">
                <i class="material-icons mdl-list__item-icon">specIcon</i>
                specLib
            </span>
        </a>
    </li>`;

var pathelt = "/";
arrayOfCurrentPath.forEach(function(element) {
    pathelt = pathelt + element + "/";
    document.getElementById("menuNav").appendChild(
        htmlToElement(
            templateLink
                .replace("specHref", pathelt)
                .replace("specIcon", "subdirectory_arrow_right")
                .replace("specLib", element)
        )
    );
});

// Increased the clicking surface of items in a directory listing
// list table
var templateItem = `
    <li class="mdl-list__item item">
	<a name="specLib" href="specHref" style="width:99%">
        <span class="mdl-list__item-primary-content">
            <span class="mdl-list__item-avatar specColor"><i class="material-icons">specIcon</i></span>
            <span>
                specLib
                <span class="second_line">specInfo</span>
            </span>
        </span>
	</a>
        <span class="mdl-list__item-secondary-content">
            <a class="mdl-list__item-secondary-action mdl-color-text--accent specViewGetInfo" href="#" onclick="clickGetInfo(specId)">
                <i class="material-icons">more_vert</i>
            </a>
        </span>
    </li>
`;

var listOfItems = document
    .getElementById("list")
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
var href = "";
var lib = "";
var size = "";
var dte = "";
var icon = ""; // folder_open or insert_drive_file
var color = ""; // mdl-color--accent or mdl-color--accent-dark
var viewGetInfo = "";
var txtInfo = "";
var typOfSort = "name";
try {
    if (window.location.href.split("?")[1].split("&")[0] == "C=M") {
        typOfSort = "date";
    }
    if (window.location.href.split("?")[1].split("&")[0] == "NUM") {
	typOfSort = "number";
    }
    if (window.location.href.split("?")[1].split("&")[0] == "C=S") {
        typOfSort = "size";
    }
} catch (error) {}
for (var i = 0; i < listOfItems.length; ++i) {
    var item = listOfItems[i];
    href = item.children[0].children[0].href;
    lib = item.children[0].children[0].textContent;
    size = item.children[1].textContent;
    dte = item.children[2].textContent;
    viewGetInfo = "";
    txtInfo = "";
    if (lib.substring(lib.length - 1) == "/") {
        icon = "folder_open";
        color = "mdl-color--accent";
        lib = lib.substring(0, lib.length - 1);
    } else {
        icon = "insert_drive_file";
        color = "mdl-color--accent-dark";
    }
    if (size == "-") {
        size = "";
    }
    if (dte == "-") {
        dte = "";
    }
    if (size == "" && dte == "" && lib == "Parent directory") {
        icon = "arrow_back";
        color = "mdl-color--primary";
        viewGetInfo = "getinfo-novisible";
    }
    if (typOfSort == "date") {
        txtInfo = dte;
    }
    if (typOfSort == "size") {
        txtInfo = size;
    }

    // Do not display the default listing (unsorted) when sorting by number
    if (typOfSort != "number") {
        document.getElementById("listItems").appendChild(
            htmlToElement(
                templateItem
                    .replace("specHref", href)
                    .replace("specIcon", icon)
                    .replace("specInfo", txtInfo)
                    .replace("specColor", color)
                    .replace("specLib", lib)
                    .replace("specLib", lib)
                    .replace("specViewGetInfo", viewGetInfo)
                    .replace("specId", i)
            )
        );
    }
}

