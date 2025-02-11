document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;

        if (!url.includes("prog.co.il/threads")) {
            document.getElementById("exportButton").disabled = true;
            return;
        }

        // בדיקת המצב הנוכחי
        chrome.storage.local.get(["threadUrl", "currentPage", "totalPages", "downloadStatus", "lastUpdate"], (result) => {
            if (result.threadUrl !== url) {
                return;
            }

            const { currentPage = 0, totalPages = 0, downloadStatus = null } = result;

            // בדיקה האם ההורדה פעילה (לא ישנה מדי)
            const isActive = result.lastUpdate && (Date.now() - result.lastUpdate < 30000); // 30 שניות

            if (downloadStatus === 'downloading' && isActive) {
                showDownloadingState();
                if (totalPages > 0) {
                    updateProgressBar(currentPage, totalPages);
                }
            } else if (downloadStatus === 'complete') {
                showCompletedState();
            }
        });
    });
});

function showDownloadingState() {
    const exportButton = document.getElementById("exportButton");
    exportButton.disabled = true;
    exportButton.innerHTML = "<h2>מייצא...</h2>";
    exportButton.style.color = "black";
    document.getElementById('statusContainer').style.display = 'flex';
}

function showCompletedState() {
    const exportButton = document.getElementById("exportButton");
    exportButton.disabled = false;
    exportButton.innerHTML = "<h2>הורד אשכול זה</h2>";
    exportButton.style.color = "white";
    hideStatus();
    updateDownloadMessage();
}

const exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", () => {
    exportButton.disabled = true;
    exportButton.textContent = "מייצא...";
    exportButton.style.color = "black";
    // שליחת הודעה לסקריפט התוכן
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["scripts/content.js"],
        });
    });
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "totalPages") {
        totalPages = message.totalPages;
        chrome.storage.local.set({ totalPages });
        showStatus(`מתחיל באנליזה של ${totalPages} עמודים...`);
    } else if (message.type === "pageAnalyzed") {
        currentPage = message.currentPage;
        updateProgressBar(currentPage, totalPages);
        showStatus(`מנתח את עמוד ${currentPage}`);
    } else if (message.type === "downloadComplete") {
        chrome.storage.local.set({
            downloadStatus: 'complete',
            lastUpdate: Date.now()
        });
        showCompletedState();
    }
    sendResponse({ status: "received" });
});

function updateProgressBar(current, total) {
    console.log(current, total);
    const progressBar = document.getElementById("progressBar");
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${current} / ${total} עמודים נותחו`;
}

function updateDownloadMessage() {
    const downloadMessageContainer = document.getElementById("downloadMessageContainer");
    downloadMessageContainer.style.display = "block";
    const downloadMessageLink = document.getElementById("downloadMessageLink");
    downloadMessageLink.href = createPrompt();
}

document.getElementById("openSettingsButton").addEventListener("click", () => {
    const settingsUrl = chrome.runtime.getURL("setting.html");
    chrome.tabs.create({ url: settingsUrl });
});

function createPrompt() {
    let settings = localStorage.getItem('extensionSettings');
    if (!settings) {
        return "https://chatgpt.com?prompt=סכם לי ביסודיות את הדיון בפורום אחרי קריאה ממעמיקה של הקובץ המצורף";
    }
    settings = JSON.parse(settings);
    let prompt = `נא סכם בהרחבה את הדיון המתועד בקובץ המצורף. `;
    if (settings.language === "en") {
        prompt += ` הסיכום יהיה בשפה האנגלית. `;
    }
    const postWeight = settings.postWeight;
    if (postWeight.length > 0) {
        prompt += ` תן משקל לפוסטים של משתמשים: `;
        postWeight.forEach(weight => {
            prompt += `${weight.replace("rank", " דרגה ")}\n`;
        });
    }
    const stats = settings.stats;
    if (stats.length > 0) {
        prompt += `לאחר הסיכום ובנוסף עליו, כלול גם סטטיסטיקות מפורטות על:\n `;
        if (stats.includes("total-posts")) {
            prompt += `כמות הפוסטים\n `;
        }
        if (stats.includes("top-users")) {
            prompt += `עשרת המשתמשים הפעילים ביותר\n `;
        }
        if (stats.includes("longest-post")) {
            prompt += `הפוסט הארוך ביותר\n `;
        }
    }
    const notes = settings.notes;
    if (notes) {
        prompt += ` הערות:\n${notes}`;
    }
    return "https://chatgpt.com/?prompt=" + prompt;
}

//status functions
function showStatus(text) {
    const statusContainer = document.getElementById('statusContainer');
    const statusText = document.getElementById('statusText');
    statusText.textContent = text;
    statusContainer.style.display = 'flex';
}

function hideStatus() {
    document.getElementById('statusContainer').style.display = 'none';
}

