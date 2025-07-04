function getLastPageNumber() {
    const pages = document.querySelectorAll('.pageNav-page');
    let lastPage = 1;

    pages.forEach((page) => {
        const pageNumber = parseInt(page.textContent.trim());
        if (!isNaN(pageNumber) && pageNumber > lastPage) {
            lastPage = pageNumber;
        }
    });
    chrome.storage.local.set({ totalPages: lastPage }, () => { });

    return lastPage;
}

function notifyPageAnalyzed(pageNumber, totalPages) {
    chrome.storage.local.set({ currentPage: pageNumber, totalPages: totalPages }, () => {

    });
    chrome.runtime.sendMessage({
        type: "pageAnalyzed",
        currentPage: pageNumber,
        totalPages: totalPages
    });
}

async function getPostsFromThread(threadUrl) {
    let posts = [];// an array of all posts in the thread


    let currentPageUrl = threadUrl.split('/page-')[0] + "/"; // the url of the first page of the thread

    let pageNumber = 1; // the number of the current page

    // fetch the first page content
    let response = await fetch(currentPageUrl);
    let html = await response.text();
    let parser = new DOMParser();
    let document = parser.parseFromString(html, 'text/html');
    posts.push({ pageNumber: `page-${pageNumber}`, posts: getPostsFromPage(document) });

    let label = document.querySelectorAll(".label.label--primary");
    if (label.length > 0) {
        label = label[0].textContent.trim();
    } else {
        label = "לא ידוע";
    }

    let title = document.querySelectorAll(".p-title-value");
    if (title.length > 0) {
        title = title[0].textContent.trim();
    } else {
        title = "לא ידוע";
    }

    const lastPageNumber = getLastPageNumber();

    while (true) {
        let nextPageContent = await getNextPageContent(currentPageUrl);
        notifyPageAnalyzed(pageNumber, lastPageNumber);

        // if the next page content is null then break the loop
        if (nextPageContent === null) {
            break;
        }

        pageNumber++;
        currentPageUrl = nextPageContent[1]; // set the current page url to the next page url
        document = nextPageContent[0]; // set the current page document to the next page document
        posts.push({ pageNumber: `page-${pageNumber}`, posts: getPostsFromPage(document) });
    }

    return [title, label, posts];
}

async function getNextPageContent(currentPageUrl) {
    let currentPage = currentPageUrl.split('/').pop(); // get the current page number

    // if the current page is the first page (without a number) then set it to 1
    if (!currentPage.includes('page')) {
        currentPage = "page-1";
        currentPageUrl += `${currentPage}`;
    }

    // get the next page number
    let nextPage = parseInt(currentPage.split("-").pop()) + 1;
    const nextPageUrl = currentPageUrl.replace(currentPage, `page-${nextPage}`);

    // fetch the next page content
    const response = await fetch(nextPageUrl);


    // if the response is ok and not redirected
    if (response.status === 200 && response.redirected === false) {
        const html = await response.text();
        const parser = new DOMParser();
        const document = parser.parseFromString(html, 'text/html');
        return [document, nextPageUrl]; // return the document and the url of the next page
    } else {
        return null; // return null if the response is not ok
    }
}

function getPostsFromPage(doc) {
    let posts = []; // an array of all posts in the page

    // get all posts elements in the page
    let postsElements = doc.querySelectorAll('article[class*="message--post"]');

    postsElements.forEach((postElement) => {
        // get the auoter name and level
        let auoterName = postElement.querySelector('.message-name span').textContent;
        let auoterLevel = postElement.querySelector('h5[class*="userTitle"]').textContent;

        // create an auoter object with the data
        let auoter = new Auoter(auoterName, auoterLevel);

        // get the post content
        let postContent = postElement.querySelector('.bbWrapper');
        if (postContent === null) {
            return;
        }

        // get all qoutes in the post
        let quotes = [];
        if (postContent.querySelector('blockquote')) {
            const quotePosts = postContent.querySelectorAll('blockquote');
            quotePosts.forEach((quotePost) => {
                let quotePostContent = quotePost.querySelector('div[class*="bbCodeBlock-expandContent"]').textContent;
                let quotePostAuoterName = quotePost.querySelector('a').textContent;
                quotes.push(new QuotePost(quotePostAuoterName, quotePostContent, null));
                quotePost.parentNode.removeChild(quotePost); // remove the qoute from the post content
            });
        }

        let postText = postContent.textContent; // the text cntent of the post

        let postDate = postElement.querySelector('time')?.dateTime; // the date of the post

        let number = postElement.querySelectorAll('.message-attribution-opposite a')[1].textContent.trim(); // the number of the post

        let post = new Post(auoter, number, postText, postDate, quotes); // create a post object with the data

        posts.push(post);
    });

    return posts;
}

function Post(auoter, numbar, content, date, QuotesPost) {
    this.auoter = auoter;
    this.number = numbar;
    this.content = content;
    this.date = date;
    this.QuotePost = QuotesPost;
}

function QuotePost(auoterName, content, QuotePost) {
    this.auoterName = auoterName;
    this.content = content;
    this.QuotePost = QuotePost;
}

function Auoter(name, level) {
    this.name = name;
    this.level = level;
}


function getThreadId(threadUrl) {
    return threadUrl.split('threads/')[1].split('.')[1].split("/")[0];
}


async function downloadPostsAsJson(threadUrl) {
    try {

        // Save the url of the thread
        chrome.storage.local.set({ threadUrl });

        // Call the function to get all posts from the thread
        const posts = await getPostsFromThread(threadUrl);

        const thread = {
            title: posts[0],
            label: posts[1],
            posts: posts[2]
        }

        // Convert posts array to JSON string
        const postsJson = JSON.stringify(thread, null, 2);

        // Create a Blob object from the JSON string
        const blob = new Blob([postsJson], { type: 'application/json' });

        // Create a URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create an anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = getThreadId(threadUrl) + '.json'; // The name of the downloaded file
        a.style.display = 'none';

        // Append the anchor to the body, trigger the download, and then remove it
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the object URL to release memory
        URL.revokeObjectURL(url);

        console.log('File downloaded successfully!');
        chrome.runtime.sendMessage({ type: "downloadComplete" });
    } catch (error) {
        console.error('Error while downloading posts:', error);
    }
}

// Call the function to test (use the current thread URL as input)
downloadPostsAsJson(window.location.href);


chrome.runtime.sendMessage({ type: "totalPages", totalPages: getLastPageNumber() });

