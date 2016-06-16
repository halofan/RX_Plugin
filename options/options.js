chrome.storage.local.get("new_limiter", function(a) {
    var _new_limiter = a.new_limiter;
    main(_new_limiter);
});

function main(new_limiter) {
    var _searchById = document.getElementById("searchById");
    document.getElementById("new_limiter").onchange = saveOptions;
    document.getElementById("advencedOptButton").onclick = toggleAdvenced;
    document.getElementById("clearAnons").onclick = clearAnons;
    _searchById.onclick = searchById;
    chrome.storage.local.get("searchById", function(a) {
        _searchById.checked = a.searchById;
    });

    document.getElementById("new_limiter").value = new_limiter || "";
    toggleAdvenced();
}

function searchById() {
    chrome.storage.local.set({"searchById": document.getElementById("searchById").checked});
}

function saveOptions() {
    chrome.storage.local.set({"new_limiter": document.getElementById("new_limiter").value});
}

function toggleAdvenced() {
    $("#advencedOpt").toggle();
}

function clearAnons() {
    chrome.storage.local.remove(document.getElementById("anonsId").value);
}