async function getPostsFromThread(threadUrl) {
    let posts = [];// an array of all posts in the thread


    let currentPageUrl = threadUrl.split('/page-')[0] + "/"; // the url of the first page of the thread

    let pageNumber = 1; // the number of the current page

    // fetch the first page content
    let response = await fetch(currentPageUrl);
    let html = await response.text();
    let parser = new DOMParser();
    let document = parser.parseFromString(html, 'text/html');
    posts.push({pageNumber : `page-${pageNumber}` , posts : getPostsFromPage(document)});

    while (true) {
        let nextPageContent = await getNextPageContent(currentPageUrl);
        
        console.log(`page-${pageNumber} done`);
        console.log(posts);

        // if the next page content is null then break the loop
        if (nextPageContent === null) {
            break;
        }

        pageNumber++;
        currentPageUrl = nextPageContent[1]; // set the current page url to the next page url
        document = nextPageContent[0]; // set the current page document to the next page document
        posts.push({pageNumber : `page-${pageNumber}` , posts : getPostsFromPage(document)});
    }

    return posts;
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

    console.log(response);

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
        let auoterName = postElement.querySelector('.message-name a span').textContent;
        let auoterLevel = postElement.querySelector('h5[class*="userTitle"]').textContent;

        // create an auoter object with the data
        let auoter = new Auoter(auoterName, auoterLevel);

        // get the post content
        let postContent = postElement.querySelector('.bbWrapper');

        // get all qoutes in the post
        let qoutes = [];
        if (postContent.querySelector('blockquote')) {
            const qoutePosts = postContent.querySelectorAll('blockquote');
            qoutePosts.forEach((qoutePost) => {
                let qoutePostContent = qoutePost.querySelector('div[class*="bbCodeBlock-expandContent"]').textContent;
                let qoutePostAuoterName = qoutePost.querySelector('a').textContent;
                qoutes.push(new QoutePost(qoutePostAuoterName, qoutePostContent, null));
                qoutePost.parentNode.removeChild(qoutePost); // remove the qoute from the post content
            });
        }

        let postText = postContent.textContent; // the text cntent of the post

        let postDate = postElement.querySelector('time').dateTime; // the date of the post

        let numbar = postElement.querySelectorAll('.message-attribution-opposite a')[1].textContent.trim(); // the number of the post

        let post = new Post(auoter, numbar, postText, postDate, qoutes); // create a post object with the data

        posts.push(post);
    });

    return posts;
}

function Post(auoter, numbar, content, date, QoutesPost) {
    this.auoter = auoter;
    this.numbar = numbar;
    this.content = content;
    this.date = date;
    this.QoutePost = QoutesPost;
}

function QoutePost(auoterName, content, QoutePost) {
    this.auoterName = auoterName;
    this.content = content;
    this.QoutePost = QoutePost;
}

function Auoter(name, level) {
    this.name = name;
    this.level = level;
}

function getThreadId(threadUrl) {
    return threadUrl.split('threads/')[1].split('.')[1].split('_')[0];
}


async function downloadPostsAsJson(threadUrl) {
    try {
        // Call the function to get all posts from the thread
        const posts = await getPostsFromThread(threadUrl);

        // Convert posts array to JSON string
        const postsJson = JSON.stringify(posts, null, 2);

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
    } catch (error) {
        console.error('Error while downloading posts:', error);
    }
}

// Call the function to test (use the current thread URL as input)
downloadPostsAsJson(window.location.href);
