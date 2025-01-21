document.getElementById("exportButton").addEventListener("click", () => {
    console.log("sdfsd");
    // שליחת הודעה לסקריפט התוכן
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["scripts/content.js"],
        });
    });
});

let totalPages = 0;
let currentPage = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "totalPages") {
        totalPages = message.totalPages;
    } else if (message.type === "pageAnalyzed") {
        currentPage = message.currentPage;
        updateProgressBar(currentPage, totalPages);
    }
    sendResponse({ status: "received" });
});

function updateProgressBar(current, total) {
    const progressBar = document.getElementById("progressBar");
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${current} / ${total} pages analyzed`;
}


