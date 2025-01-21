function getPostsFromPage() {
    let posts = [];// an array of all posts in the page
    let postsElements = document.querySelectorAll('article[class*="message--post"]');

    postsElements.forEach((postElement) => {
        let auoterName = postElement.querySelector('.message-name a span').textContent;
        let auoterLevel = postElement.querySelector('h5[class*="userTitle"]').textContent;

        let auoter = new Auoter(auoterName, auoterLevel);

        let postContent = postElement.querySelector('.bbWrapper');

        let qoutes = [];
        if (postContent.querySelector('blockquote')) {
            const qoutePosts = postContent.querySelectorAll('blockquote');
            qoutePosts.forEach((qoutePost) => {
                let qoutePostContent = qoutePost.querySelector('div[class*="bbCodeBlock-expandContent"]').textContent;
                let qoutePostAuoterName = qoutePost.querySelector('a').textContent;
                qoutes.push(new QoutePost(qoutePostAuoterName, qoutePostContent, null));
                qoutePost.parentNode.removeChild(qoutePost);
            });
        }

        let postText = postContent.textContent; // the text of the post

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
console.log("test");
console.log(getPostsFromPage());