//בודק האם מדובר בכתובת רלוונטית
document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        const url = tabs[0].url;
        console.log(url);
        if (!url.includes("prog.co.il/threads")) {
            console.log("not a relevant page");
            document.getElementById("exportButton").disabled = true;
        }

        chrome.storage.local.get(["threadUrl", "currentPage", "totalPages", "isDownloadComplete"], (result) => {
            console.log(result.threadUrl);
            console.log(url);

            if (result.threadUrl !== url) {
                result = {};
            }
            const { currentPage = 0, totalPages = 0, isDownloadComplete = false } = result;
            if (totalPages > 0) {
                updateProgressBar(currentPage, totalPages);
            }
            if (isDownloadComplete) {
                updateDownloadMessage();
            }
        });
    });
});


document.getElementById("exportButton").addEventListener("click", () => {
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
    } else if (message.type === "downloadComplete") {
        updateDownloadMessage();
    }
    sendResponse({ status: "received" });
});

function updateProgressBar(current, total) {
    const progressBar = document.getElementById("progressBar");
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${current} / ${total} עמודים נותחו`;
}

function updateDownloadMessage() {
    const downloadMessage = document.getElementById("downloadMessage");
    downloadMessage.textContent = "ההורדה הושלמה. לחץ כאן כדי לסכם את הדיון עם GPT!";
}


