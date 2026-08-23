function getDriveImageSrc(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    return url;
}
console.log(getDriveImageSrc("https://drive.google.com/file/d/1B7jB3hXz/view?usp=drivesdk"));
