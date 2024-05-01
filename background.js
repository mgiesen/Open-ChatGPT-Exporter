function updateIcon(tabId, url)
{
    const hostname = new URL(url).hostname;
    const iconPath = hostname === "chat.openai.com" ? "active" : "inactive";
    chrome.action.setIcon({
        path: {
            "16": `icons/${iconPath}/icon16.png`,
            "24": `icons/${iconPath}/icon24.png`,
            "32": `icons/${iconPath}/icon32.png`,
            "48": `icons/${iconPath}/icon48.png`,
            "64": `icons/${iconPath}/icon64.png`,
            "128": `icons/${iconPath}/icon128.png`
        },
        tabId: tabId
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
    // Aktualisiere Icon wenn die Seite neu geladen oder die URL geändert wird
    if (changeInfo.status === 'complete' || changeInfo.url)
    {
        updateIcon(tabId, tab.url);
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo)
{
    // Aktualisiere Icon wenn der Tab gewechselt wird
    chrome.tabs.get(activeInfo.tabId, function (tab)
    {
        updateIcon(activeInfo.tabId, tab.url);
    });
});
