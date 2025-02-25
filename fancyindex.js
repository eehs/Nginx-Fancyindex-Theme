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

var searchFieldWasEmptied = false;
function clickResetSearch(reloadPage=true) {
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

        if (reloadPage || searchFieldWasEmptied || document.getElementById("search-field").value.length > 0) {
                document.getElementById("listItems").innerHTML = "";
                window.location.reload();
        }

        document.getElementById("search-field").value = "";
        sessionStorage["search_query"] = "";

        searchFieldWasEmptied = false;
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

        // Search info and insert into dialog
        dialog.showModal();
}

// Sort items in directory listing by date, number, name or size
function sortDirectoryListing(calledFromSearch=false) {
        var templateItem = `
                <li class="mdl-list__item item">
                        <a name="specLib" href="specHref" onclick="clickResetSearch(false)" style="width:99%">
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
        try {
                if (window.location.href.split("?")[1].split("&")[0] == "C=M") {
                        typOfSort = "date";
                }
                if (window.location.href.split("?")[1].split("&")[0] == "C=NUM") {
                        typOfSort = "number";
                }
                if (window.location.href.split("?")[1].split("&")[0] == "C=S") {
                        typOfSort = "size";
                }
        } catch (error) {}

        var listOfItems = document
                .getElementById("list")
                .getElementsByTagName("tbody")[0]
                .getElementsByTagName("tr");

        var preSortedDirectoryMap = new Map();
        var preSortedMap = new Map();

        var href = window.location.href;
        var order = (href[href.length - 1] == "/") ? "O=A" : href.split("?")[1].split("&")[1];

        for (var i = 0; i < listOfItems.length; i++) {
                var itemTextArr = listOfItems[i].children[0].children[0].text.split("/");
                var itemText = (calledFromSearch) ? itemTextArr[itemTextArr.length - 1] : listOfItems[i].children[0].children[0].text;
                var item;

                try {
                        if (typOfSort == "date") {
                                item = listOfItems[i].children[2].innerText.match(/\d{4}-\d{2}-\d{2}, \d{2}:\d{2}/)
                        }
                        if (typOfSort == "number") {
                                item = Number(itemText.match(/\d{1,}/))
                        }
                        if (typOfSort == "name") {
                                item = itemTextArr[itemTextArr.length - 1];
                        }
                        if (typOfSort == "size") {
                                size = listOfItems[i].children[1].innerText.split(" ");
                                var sizeFloat = size[0];
                                var sizeUnit = size[1];

                                switch (sizeUnit) {
                                                // NOTE: File sizes bigger than a petabyte is ridiculous, so this is the ceiling.
                                        case "PiB":
                                                item = parseFloat(sizeFloat) * 1000000000;
                                                break;
                                        case "TiB":
                                                item = parseFloat(sizeFloat) * 1000000;
                                                break;
                                        case "GiB":
                                                item = parseFloat(sizeFloat) * 1000;
                                                break;
                                        default:
                                                item = sizeFloat;
                                }
                        }
                } catch (error) {}


                // Sort directories by date separately since they appear first on the displayed directory listing
                if (typOfSort == "date" && itemText[itemText.length - 1] == "/" || typOfSort == "name" && order == "O=D" && itemText[itemText.length - 1] == "/") {
                        preSortedDirectoryMap.set(i, item);
                } else {
                        preSortedMap.set(i,
                                (i > 0 && typOfSort == "number" && order == "O=D" && item == 0) ? listOfItems.length :
                                (i > 0 && typOfSort == "size" && order == "O=D" && item == "-") ? 1000000000000 : // petabyte * 1000 = 1 exabyte
                                (i > 0 && typOfSort == "number" && order == "O=A" && itemText[itemText.length - 1] == "/" && item == 0) ? listOfItems.length : // for listing directories first when sorting by number in ascending order
                                (i > 0 && (typOfSort == "number" || typOfSort == "size") && order == "O=A" && (item == 0 || item == "-")) ? 0 : item);
                }
        }

        var sortedDirectoryMap = new Map();
        var sortedMap = new Map();

        try {
                // Date
                if (typOfSort == "date") {
                        if (order == "O=A") {
                                sortedDirectoryMap = Array.from(preSortedDirectoryMap).sort((a, b) => new Date(a[1]) - new Date(b[1]));
                                sortedMap = Array.from(preSortedMap).sort((a, b) => new Date(a[1]) - new Date(b[1]));
                        }
                        if (order == "O=D") {
                                sortedDirectoryMap = Array.from(preSortedDirectoryMap).sort((a, b) => new Date(b[1]) - new Date(a[1]));
                                sortedMap = Array.from(preSortedMap).sort((a, b) => new Date(b[1]) - new Date(a[1]));
                        }

                        sortedMap = [].concat(sortedDirectoryMap, sortedMap);
                }

                // Number
                if (typOfSort == "number") {
                        if (order == "O=A") {
                                sortedMap = Array.from(preSortedMap).sort((a, b) => a[1] > b[1] ? 1 : b[1] > a[1] ? -1 : 0);
                        }
                        if (order == "O=D") {
                                sortedMap = Array.from(preSortedMap).sort((a, b) => a[1] != 0 && a[1] < b[1] ? 1 : b[1] != 0 && b[1] < a[1] ? -1 : 0);
                        }
                }

                // Name
                if (typOfSort == "name") {
                        if (order == "O=A") {
                                sortedMap = Array.from(preSortedMap).sort((a, b) => a[1] > b[1] ? 1 : b[1] > a[1] ? -1 : 0);
                        }
                        if (order == "O=D") {
                                sortedDirectoryMap = Array.from(preSortedDirectoryMap).sort((a, b) => a[1] != "" && a[1] < b[1] ? 1 : b[1] != "" && b[1] < a[1] ? -1 : 0);
                                sortedMap = Array.from(preSortedMap).sort((a, b) => a[1] != "" && a[1] < b[1] ? 1 : b[1] != "" && b[1] < a[1] ? -1 : 0);

                                sortedMap = [].concat(sortedDirectoryMap, sortedMap);
                        }
                }

                // Size
                if (typOfSort == "size") {
                        if (order == "O=A") {
                                sortedMap = Array.from(preSortedMap).sort((a, b) => a[1] - b[1]);
                        }
                        if (order == "O=D") {
                                sortedMap = Array.from(preSortedMap).sort((a, b) => b[1] - a[1]);
                        }
                }
        } catch (error) {}

        var sortedListOfItems = [];
        for (var i = 0; i < listOfItems.length; i++) {
                var clonedItem = listOfItems[sortedMap[i][0]].cloneNode(true);
                sortedListOfItems.push(clonedItem);
        }

        // Create the sorted elements and append them to parent list
        for (var i = 0; i < sortedListOfItems.length; i++) {
                var sortedItem = sortedListOfItems[i];

                href = sortedItem.children[0].innerHTML.match(/href=\"(.*?)\"/)[1];
                        listOfItems[i].children[0].children[0].href = sortedItem.children[0].children[0].href;
                        listOfItems[i].children[0].children[0].title = sortedItem.children[0].children[0].title;
                        listOfItems[i].children[0].children[0].text = sortedItem.children[0].children[0].text;

                        lib = (sortedItem.children[0].children[0].title == "") ? "Parent directory" : sortedItem.children[0].children[0].text;
                        size = sortedItem.children[1].textContent;
                        listOfItems[i].children[1].textContent = size;

                        dte = sortedItem.children[2].textContent;
                        listOfItems[i].children[2].textContent = dte;

                        viewGetInfo = "";
                        txtInfo = "";

                        if (lib.substring(lib.length - 1) == "/") {
                                if (href.split("?")[1] == undefined) {
                                        href += window.location.search;
                                }

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
                        if (href.split("?")[1] == undefined) {
                                href += window.location.search;
                        }

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

// Recursively searching is optional
async function runSearch(path, recursive=false, nested=false) {
        if (path != undefined && path.includes("Parent directory/")) {
                return;
        }

        var res = (path != undefined)
                ? await fetch(encodeURIComponent(path))
                : await fetch(window.location.href)

        if (!res.ok) {
                return;
        }

        var htmlString = await res.text();
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlString, "text/html");

        var listOfItems = doc 
                .getElementById("list")
                .getElementsByTagName("tbody")[0]
                .getElementsByTagName("tr");

        for (var i = 0; i < listOfItems.length; i++) {
                var itemText = listOfItems[i].children[0].children[0].text;
                if (nested) {
                        listOfItems[i].children[0].children[0].text = `${path}${itemText}`;
                        itemText = listOfItems[i].children[0].children[0].text;
                }

                var itemHref = listOfItems[i].children[0].children[0].href;
                var parentDirHref = new URL("../", document.baseURI).href;

                if (recursive == true && itemText[itemText.length - 1] == "/" && itemHref != parentDirHref) {
                        await runSearch(`${itemText}`, true, true);
                }
        }

        var searchRegex = document.getElementById("search-field").value;
        sessionStorage["search_query"] = searchRegex;

        for (var i = 0; i < listOfItems.length; i++) {
                var item = listOfItems[i];
                var itemText = listOfItems[i].children[0].children[0].text;

                if (itemText.includes("Parent directory/")) {
                        continue;
                }

                if (itemText.match(new RegExp(searchRegex, "i"))) {
                        var templateItem = `
                                <li class="mdl-list__item item">
                                        <a name="specLib" href="specHref" onclick="clickResetSearch(false)" style="width:99%">
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

                        var templateTableDataMetadata = `
                                <tr>
                                        <td colspan="2" class="link">
                                                <a href="specHref" title="specLib">specLib</a>
                                        </td>
                                        <td class="size">specSize</td>
                                        <td class="date">specDte</td>
                                </tr>
                        `;

                        var parentDirHref = new URL("../", document.baseURI).href;
                        var itemUrl = new URL(item.children[0].children[0].href);
                        itemUrl.search = "";

                        var href = (itemUrl.href == parentDirHref) ? parentDirHref : itemText;
                        var lib = itemText;
                        var size = item.children[1].textContent;
                        var dte = item.children[2].textContent;
                        var icon = ""; // folder_open or insert_drive_file
                        var color = ""; // mdl-color--accent or mdl-color--accent-dark
                        var viewGetInfo = "";
                        var txtInfo = "";
                        var typOfSort = "name";

                        try {
                                if (window.location.href.split("?")[1].split("&")[0] == "C=M") {
                                        typOfSort = "date";
                                }
                                if (window.location.href.split("?")[1].split("&")[0] == "C=NUM") {
                                        typOfSort = "number";
                                }
                                if (window.location.href.split("?")[1].split("&")[0] == "C=S") {
                                        typOfSort = "size";
                                }
                        } catch (error) {}

                        if (lib.substring(lib.length - 1) == "/") {
                                if (href.split("?")[1] == undefined) {
                                        href += window.location.search;
                                }

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
                                if (href.split("?")[1] == undefined) {
                                        href += window.location.search;
                                }

                                icon = "arrow_back";
                                color = "mdl-color--primary";
                                viewGetInfo = "getinfo-novisible";
                        }

                        if (icon == "folder_open") {
                                if (typOfSort == "date") {
                                        txtInfo = dte;
                                }
                                if (typOfSort == "size") {
                                        txtInfo = size;
                                }
                        }

                        var id = document
                                .getElementById("list")
                                .getElementsByTagName("tbody")[0]
                                .getElementsByTagName("tr").length;

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
                                        .replace("specId", id)
                                )
                        );

                        document.getElementById("list").children[1].appendChild(
                                htmlToElement(
                                        templateTableDataMetadata
                                        .replace("specHref", href)
                                        .replace("specLib", (size == "") ? `${lib}/` : lib)
                                        .replace("specLib", (size == "") ? `${lib}/` : lib)
                                        .replace("specSize", (size == "" ? "-" : size))
                                        .replace("specDte", dte)
                                )
                        );

                        if (i == listOfItems.length - 1) {
                                document.getElementById("listItems").innerHTML = "";
                        }
                } 
        }
}

// Get enter in the input field search
var input = document.getElementById("search-field");
var searchTimer;
input.addEventListener("input", function(event) {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(async () => {
                event.preventDefault();
                document.getElementById("listItems").innerHTML = "";
                document.getElementById("list").children[1].innerHTML = "";

                await runSearch(undefined, true);
                document.getElementById("listItems").innerHTML = "";

                var href = window.location.href;
                var sortQuery = (href[href.length - 1] == "/") ? "C=N" : href.split("?")[1].split("&")[0];
                if (sortQuery == "C=M" || sortQuery == "C=S" || sortQuery == "C=N") {
                        sortDirectoryListing();
                } else if (sortQuery == "C=NUM") {
                        sortDirectoryListing(true);
                }

                var listOfItems = document
                        .getElementById("list")
                        .getElementsByTagName("tbody")[0]
                        .getElementsByTagName("tr");

                if (listOfItems.length >= 1) {
                        if (sessionStorage["search_query"].length >= 1) {
                                document.getElementById("listItems").prepend(htmlToElement(`<li class="mdl-list__item item"><span>Results for '${sessionStorage['search_query']}' (<b>${listOfItems.length}</b> matches)</span></li>`));
                        }
                } else {
                        document.getElementById("listItems").innerHTML = "<h5 style='text-align: center'>No results found for your search.</h5>";
                }

        }, 400); // We wait this long before running the search query, adjust as you see fit
});

// Close search bar if user clicks away from it
var searchField = document.getElementById("search-field");
searchField.addEventListener("input", function(event) {
        if (searchField.value.length < 1) {
                searchFieldWasEmptied = true;
        }
});

document.getElementById("search-field").addEventListener("focusout", function(event) {
        setTimeout(() => {
                if (document.getElementById("search-field").value.length < 1) {
                        if (searchFieldWasEmptied) {
                                clickResetSearch();
                        } else {
                                clickResetSearch(false);
                        }
                }
        }, 200);
});

// Manage title, bar, ...
var currentPath = document.getElementById("original_fancyindex").childNodes[0].textContent.trim();
document.getElementById("currentPathTitle").innerHTML = currentPath;
var arrayOfCurrentPath = currentPath.split("/");
arrayOfCurrentPath.splice(0, 1);
arrayOfCurrentPath.splice(arrayOfCurrentPath.length - 1, 1);

if (arrayOfCurrentPath.length > 0) {
        document.getElementById("currentTitle").innerHTML = arrayOfCurrentPath[arrayOfCurrentPath.length - 1];
} else {
        document.getElementById("currentTitle").innerHTML = "Root";
}
document.getElementById("homelink").href = "../".repeat(arrayOfCurrentPath.length);
document.getElementById("homebtn").href = "../".repeat(arrayOfCurrentPath.length);

// Manage sort
if (window.location.href.split("?")[1] == "C=M&O=D") {
        document.getElementById("sortByDate").href = "?C=M&O=A";
}
if (window.location.href.split("?")[1] != undefined && window.location.href.split("?")[1].split("&")[0] == "C=NUM") {
        sortDirectoryListing();
}
if (window.location.href.split("?")[1] == "C=NUM&O=D") {
        document.getElementById("sortByNumber").href = "?C=NUM&O=A";
}
if (window.location.href.split("?")[1] == "C=N&O=D") {
        document.getElementById("sortByName").href = "?C=N&O=A";
}
if (window.location.href.split("?")[1] == "C=S&O=D") {
        document.getElementById("sortBySize").href = "?C=S&O=A";
}

// Menu
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

// List table
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
        if (window.location.href.split("?")[1].split("&")[0] == "C=NUM") {
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

        // Retain search query if search field is still open (and user clicked something else)
        if (typOfSort.length > 1 && sessionStorage["search_query"] != undefined) {
                if (sessionStorage["search_query"].length > 0) {
                        clickSearch();

                        var searchField = document.getElementById("search-field");
                        searchField.value = sessionStorage["search_query"];
                        searchField.dispatchEvent(new Event("input"));
                        searchField.setSelectionRange(searchField.value.length, searchField.value.length);
                }
        }
}

